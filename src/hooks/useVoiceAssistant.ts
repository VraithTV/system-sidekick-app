import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { matchWakeWord } from '@/lib/fuzzyWake';
import { formatMemoriesForPrompt, addMemories } from '@/lib/memoryStore';
import { startSpeechRecognition } from '@/lib/speechRecognition';
import { processAppCommand } from '@/lib/appCommands';
import { processVoiceCommand } from '@/lib/voiceCommands';
import { canUseVoice, incrementUsage } from '@/lib/usageLimit';
import { getModeSystemPromptAddition } from '@/lib/modes';
import { commonApps } from '@/lib/commonApps';
import { toast } from 'sonner';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/** Try to detect an "open app" intent and actually launch it via Electron */
function tryLaunchApp(userText: string): void {
  if (!isElectron) return;
  const api = (window as any).electronAPI;
  if (!api?.openApp) return;

  // Match patterns like "open chrome", "launch spotify", "start obs", "open up discord"
  const openMatch = userText.match(/(?:open|launch|start|run|fire up|open up|pull up)\s+(.+)/i);
  if (!openMatch) return;

  const target = openMatch[1]
    .replace(/^(the|my|up)\s+/i, '')
    .replace(/\s+and\s+.*/i, '') // strip "and play ..." etc.
    .trim()
    .toLowerCase();
  if (!target) return;

  // Match against known app aliases for the correct ID
  const matched = commonApps.find((app) =>
    app.aliases.some((alias) => target === alias || target.includes(alias))
  );

  const appId = matched?.id || target;
  console.log('[Jarvis] Launching app:', appId, matched ? `(matched: ${matched.name})` : '(raw)');
  api.openApp(appId);
}

const FATAL_CAPTURE_ERRORS = new Set([
  'NotAllowedError',
  'NotFoundError',
  'NotReadableError',
  'SecurityError',
  'SpeechRecognitionUnavailableError',
]);

function pause(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const browserVoiceMap: Record<string, { keywords: string[]; gender: 'male' | 'female'; pitch: number; rate: number }> = {
  daniel:  { keywords: ['Daniel', 'Google UK English Male', 'British'], gender: 'male', pitch: 0.85, rate: 0.92 },
  george:  { keywords: ['George', 'Google UK English Male', 'British'], gender: 'male', pitch: 0.9, rate: 0.95 },
  brian:   { keywords: ['David', 'Google US English', 'Male'], gender: 'male', pitch: 0.8, rate: 0.9 },
  chris:   { keywords: ['Google US English', 'Alex', 'Male'], gender: 'male', pitch: 1.0, rate: 1.0 },
  liam:    { keywords: ['Google UK English Male', 'Liam', 'Male'], gender: 'male', pitch: 1.05, rate: 0.98 },
  eric:    { keywords: ['Google US English', 'Fred', 'Male'], gender: 'male', pitch: 0.88, rate: 0.93 },
  alice:   { keywords: ['Google UK English Female', 'Alice', 'Female'], gender: 'female', pitch: 1.1, rate: 0.95 },
  sarah:   { keywords: ['Google US English Female', 'Samantha', 'Female'], gender: 'female', pitch: 1.05, rate: 0.92 },
};

function speakBrowser(text: string, _outputDeviceId?: string, voiceId?: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const allVoices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
    const prefs = browserVoiceMap[voiceId || 'daniel'] || browserVoiceMap.daniel;

    utterance.rate = prefs.rate;
    utterance.pitch = prefs.pitch;
    utterance.volume = 1;

    // Try to find a matching voice by keyword
    let matched: SpeechSynthesisVoice | undefined;
    for (const kw of prefs.keywords) {
      matched = allVoices.find((v) => v.name.includes(kw));
      if (matched) break;
    }
    // Fallback: pick any English voice, preferring the right gender keyword
    if (!matched) {
      const genderKw = prefs.gender === 'female' ? 'Female' : 'Male';
      matched =
        allVoices.find((v) => v.name.includes(genderKw)) ||
        allVoices.find((v) => v.name.includes('Google')) ||
        allVoices[0];
    }
    if (matched) utterance.voice = matched;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

// Keep a rolling conversation history for context
const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];
const MAX_HISTORY = 10;

function addToHistory(role: 'user' | 'assistant', content: string) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory.splice(0, conversationHistory.length - MAX_HISTORY);
  }
}

async function getAIResponse(text: string, mode?: string): Promise<string> {
  try {
    const memories = mode === 'private' ? '' : formatMemoriesForPrompt();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { supabase } = await import('@/integrations/supabase/client');

    let data: any;
    let error: any;

    try {
      const result = await supabase.functions.invoke('jarvis-chat', {
        body: { message: text, memories, timezone, mode: mode || 'assistant', conversationHistory },
      });
      data = result.data;
      error = result.error;
    } catch (networkErr) {
      console.warn('[Jarvis] Network error calling AI:', networkErr);
      return "I can't reach the server right now. Check your internet connection and try again.";
    }

    if (error) throw error;

    // Store any new memories the AI extracted
    if (data?.newMemories && Array.isArray(data.newMemories) && data.newMemories.length > 0) {
      addMemories(data.newMemories);
      console.log('[Jarvis] New memories saved:', data.newMemories);
    }

    return data?.reply || "I didn't catch that. Could you say it again?";
  } catch (e) {
    console.error('AI response error:', e);
    return "I'm having trouble connecting right now. If you're using a VPN, try switching servers or disabling it temporarily.";
  }
}

export function useVoiceAssistant(options: { previewOnly?: boolean } = {}) {
  const previewOnly = options.previewOnly ?? false;
  const { setState, addCommand, settings, setSystemStatus, mode } = useJarvisStore();
  const isListeningRef = useRef(false);
  const isCaptureLoopActiveRef = useRef(false);
  const wakeWordHeard = useRef(false);
  const conversationActive = useRef(false);
  const captureStopRef = useRef<(() => void) | null>(null);

  const processCommand = useCallback(
    async (text: string) => {
      const cleanedText = text.trim();
      if (!cleanedText) {
        if (isListeningRef.current) setState('standby');
        return;
      }

      // Check daily usage limit
      if (!canUseVoice()) {
        setState('speaking');
        const limitMsg = "You've reached your daily command limit. It resets at midnight.";
        addCommand({
          id: Date.now().toString(),
          text: cleanedText,
          response: limitMsg,
          timestamp: new Date(),
          type: 'voice',
        });
        await speakBrowser(limitMsg, settings.outputDeviceId || undefined, settings.voice);
        if (isListeningRef.current) setState('standby');
        return;
      }

      incrementUsage();
      setState('thinking');

      // Check built-in voice commands first (timer, time, math, etc.)
      const voiceResult = processVoiceCommand(cleanedText);
      let response: string;

      if (voiceResult.handled) {
        response = voiceResult.response || 'Done.';
      } else {
        // Check for app-specific commands (Spotify, URLs, etc.)
        const appResult = processAppCommand(cleanedText);

        if (appResult.handled) {
          if (appResult.async && appResult.asyncResponse) {
            response = await appResult.asyncResponse;
          } else {
            response = appResult.response || 'Done.';
          }
          tryLaunchApp(cleanedText);
        } else {
          addToHistory('user', cleanedText);
          response = await getAIResponse(cleanedText, mode);
          addToHistory('assistant', response);
          tryLaunchApp(cleanedText);
        }
      }

      setState('speaking');
      // In private mode, don't log commands
      if (mode !== 'private') {
        addCommand({
          id: Date.now().toString(),
          text: cleanedText,
          response,
          timestamp: new Date(),
          type: 'voice',
        });
      }

      await speakBrowser(response, settings.outputDeviceId || undefined, settings.voice);

      // If the response ends with a question mark, stay in conversation mode
      // so the user doesn't need the wake word for their reply
      const isQuestion = response.trim().endsWith('?');
      conversationActive.current = isQuestion;
      wakeWordHeard.current = false;

      if (!isListeningRef.current) {
        setState('idle');
        return;
      }

      if (isQuestion) {
        setState('listening');
        console.log('[Jarvis] Response was a question — staying in conversation mode');
      } else {
        setState('standby');
      }
    },
    [setState, addCommand, settings.outputDeviceId, settings.voice]
  );

  const startListening = useCallback(() => {
    if (isListeningRef.current || isCaptureLoopActiveRef.current) {
      return;
    }

    isListeningRef.current = true;
    wakeWordHeard.current = false;
    conversationActive.current = false;
    setState('standby');
    setSystemStatus({ micActive: true });

    const runCaptureLoop = async () => {
      if (isCaptureLoopActiveRef.current) {
        return;
      }

      isCaptureLoopActiveRef.current = true;

      try {
        while (isListeningRef.current) {
          const shouldBypassWakeWord = wakeWordHeard.current || conversationActive.current;

          try {
            console.log('[Jarvis] Listening for speech...');
            const recognition = startSpeechRecognition(settings.inputDeviceId || undefined, {
              preferLocal: isElectron,
            });
            captureStopRef.current = recognition.stop;
            const transcript = await recognition.promise;
            captureStopRef.current = null;

            console.log('[Jarvis] Transcript:', JSON.stringify(transcript));
            if (!isListeningRef.current) continue;
            if (!transcript) {
              await pause(100);
              continue;
            }

            if (!shouldBypassWakeWord) {
              const wakeMatch = matchWakeWord(
                transcript,
                settings.wakeName,
                settings.wakeAliases,
                settings.wakeSensitivity
              );

              if (!wakeMatch.matched) {
                continue;
              }

              if (wakeMatch.command && wakeMatch.command.length > 1) {
                wakeWordHeard.current = false;
                conversationActive.current = false;
                await processCommand(wakeMatch.command);
                continue;
              }

              wakeWordHeard.current = true;
              conversationActive.current = false;
              setState('listening');
              continue;
            }

            wakeWordHeard.current = false;
            conversationActive.current = false;
            await processCommand(transcript);
          } catch (error) {
            console.warn('[Jarvis] Voice capture loop error:', error);
            captureStopRef.current = null;
            wakeWordHeard.current = false;
            conversationActive.current = false;

            if (!isListeningRef.current) break;

            const errorName = error instanceof Error ? error.name : '';
            if (FATAL_CAPTURE_ERRORS.has(errorName)) {
              isListeningRef.current = false;
              setSystemStatus({ micActive: false });
              setState('idle');
              break;
            }

            await pause(250);
          }
        }
      } finally {
        isCaptureLoopActiveRef.current = false;
        captureStopRef.current = null;

        if (!isListeningRef.current) {
          wakeWordHeard.current = false;
          conversationActive.current = false;
          setSystemStatus({ micActive: false });
        }
      }
    };

    void runCaptureLoop();
  }, [settings.inputDeviceId, settings.wakeAliases, settings.wakeName, settings.wakeSensitivity, setState, setSystemStatus, processCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    conversationActive.current = false;
    wakeWordHeard.current = false;
    captureStopRef.current?.();
    captureStopRef.current = null;
    speechSynthesis.cancel();
    setSystemStatus({ micActive: false });
    setState('idle');
  }, [setState, setSystemStatus]);

  const previewVoice = useCallback(async (voiceId: string) => {
    await speakBrowser('At your service. How can I help you today?', settings.outputDeviceId || undefined, voiceId);
  }, [settings.outputDeviceId]);

  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (previewOnly) return;
    return stopListening;
  }, [previewOnly, stopListening]);

  return { startListening, stopListening, previewVoice };
}
