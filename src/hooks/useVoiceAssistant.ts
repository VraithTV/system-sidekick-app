import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { matchWakeWord } from '@/lib/fuzzyWake';
import { formatMemoriesForPrompt, addMemories } from '@/lib/memoryStore';
import { resetElevenLabsSTTExhausted, startSpeechRecognition } from '@/lib/speechRecognition';
import { processAppCommand } from '@/lib/appCommands';
import { processVoiceCommand } from '@/lib/voiceCommands';

import { getModeSystemPromptAddition } from '@/lib/modes';
import { commonApps } from '@/lib/commonApps';
import { isOllamaAvailable, chatWithOllama, getOllamaModel } from '@/lib/ollamaClient';
import { getLanguage } from '@/lib/languages';
import { speakWithKokoro, stopKokoroTTS, isKokoroAvailable } from '@/lib/kokoroTTS';
import { getVoiceById, voiceOptions } from '@/lib/voices';
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

export const VOICE_ASSISTANT_START_EVENT = 'jarvis:start-listening';
export const VOICE_ASSISTANT_STOP_EVENT = 'jarvis:stop-listening';

export function requestVoiceAssistantStart() {
  if (typeof window === 'undefined') return;
  if (isElectron) {
    resetElevenLabsSTTExhausted();
  }
  window.dispatchEvent(new Event(VOICE_ASSISTANT_START_EVENT));
}

export function requestVoiceAssistantStop() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(VOICE_ASSISTANT_STOP_EVENT));
}

function getVoiceCaptureErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return '';
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
}

function isFatalVoiceCaptureError(error: unknown) {
  const errorName = error instanceof Error ? error.name : '';
  return FATAL_CAPTURE_ERRORS.has(errorName);
}

function notifyVoiceCaptureError(error: unknown) {
  const errorName = error instanceof Error ? error.name : '';
  const errorCode = getVoiceCaptureErrorCode(error);

   if (errorCode === 'quota_exceeded') {
    toast.error('AI transcription credits exhausted.', {
      description: 'Add funds in Settings, then click the mic again.',
      duration: 8000,
    });
    return;
  }

  if (errorCode === 'rate_limited') {
    toast.error('Transcription rate limited.', {
      description: 'Wait a moment and try again.',
      duration: 5000,
    });
    return;
  }

  if (errorCode === 'cloud-transcription-failed') {
    toast.error('Cloud transcription is unavailable.', {
      description: error instanceof Error ? error.message : 'Check your internet connection and try again.',
      duration: 8000,
    });
    return;
  }

  if (errorName === 'SpeechRecognitionUnavailableError' || errorCode === 'unsupported') {
    const msg = error instanceof Error ? error.message : '';
    toast.error(isElectron ? 'Microphone transcription is not available.' : 'Speech recognition is not available.', {
      description: msg || (isElectron
        ? 'Check microphone access and try again.'
        : 'Use Chrome or Edge and allow microphone access.'),
      duration: 8000,
    });
    return;
  }

  if (
    errorName === 'NotAllowedError' ||
    errorName === 'SecurityError' ||
    errorCode === 'not-allowed' ||
    errorCode === 'service-not-allowed' ||
    errorCode === 'start-failed'
  ) {
    toast.error('Microphone access was blocked.', {
      description: 'Click the mic button again and allow access in your browser.',
    });
    return;
  }

  if (errorName === 'NotReadableError') {
    toast.error('Your microphone is busy.', {
      description: 'Close any other app using the mic and try again.',
    });
    return;
  }

  if (errorName === 'NotFoundError' || errorCode === 'audio-capture') {
    toast.error('No working microphone was found.', {
      description: 'Connect a microphone, then try again.',
    });
    return;
  }

  toast.error('Voice capture failed.', {
    description: 'Click the mic button again to retry.',
  });
}

const browserVoiceMap: Record<string, { keywords: string[]; gender: 'male' | 'female'; pitch: number; rate: number }> = {
  // Legacy named voices
  jarvis:  { keywords: ['Daniel', 'Microsoft Mark', 'Google UK English Male'], gender: 'male', pitch: 0.85, rate: 0.92 },
  daniel:  { keywords: ['Daniel', 'Microsoft Mark', 'Google UK English Male'], gender: 'male', pitch: 0.88, rate: 0.94 },
  george:  { keywords: ['George', 'Microsoft George', 'Google UK English Male'], gender: 'male', pitch: 0.92, rate: 0.96 },
  brian:   { keywords: ['David', 'Microsoft David', 'Google US English'], gender: 'male', pitch: 0.85, rate: 0.92 },
  chris:   { keywords: ['Google US English', 'Alex', 'Microsoft Mark'], gender: 'male', pitch: 0.95, rate: 0.98 },
  liam:    { keywords: ['Google UK English Male', 'Liam', 'Microsoft Ryan'], gender: 'male', pitch: 1.0, rate: 0.96 },
  eric:    { keywords: ['Google US English', 'Fred', 'Microsoft Eric'], gender: 'male', pitch: 0.9, rate: 0.95 },
  alice:   { keywords: ['Google UK English Female', 'Microsoft Hazel', 'Alice'], gender: 'female', pitch: 1.05, rate: 0.94 },
  sarah:   { keywords: ['Google US English Female', 'Samantha', 'Microsoft Zira'], gender: 'female', pitch: 1.0, rate: 0.93 },
  // Kokoro voice IDs mapped to distinct browser voices
  kokoro_bella:    { keywords: ['Samantha', 'Google US English Female', 'Microsoft Zira'], gender: 'female', pitch: 1.0, rate: 0.94 },
  kokoro_adam:     { keywords: ['Alex', 'Google US English', 'Microsoft David'], gender: 'male', pitch: 0.92, rate: 0.96 },
  kokoro_emma:     { keywords: ['Google UK English Female', 'Microsoft Hazel', 'Kate'], gender: 'female', pitch: 1.08, rate: 0.92 },
  kokoro_george:   { keywords: ['George', 'Microsoft George', 'Google UK English Male'], gender: 'male', pitch: 0.88, rate: 0.94 },
  kokoro_nicole:   { keywords: ['Google US English Female', 'Microsoft Zira', 'Samantha'], gender: 'female', pitch: 0.95, rate: 0.98 },
  kokoro_michael:  { keywords: ['Daniel', 'Microsoft Mark', 'Google UK English Male'], gender: 'male', pitch: 0.82, rate: 0.90 },
};

// Workaround for Chrome bug where speechSynthesis stops working after ~15s of inactivity
let speechKeepAliveInterval: ReturnType<typeof setInterval> | null = null;

function ensureSpeechSynthesisActive() {
  if (speechKeepAliveInterval) return;
  speechKeepAliveInterval = setInterval(() => {
    if (!speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }, 10000);
}

/** Pre-create a SpeechSynthesisUtterance so it's ready to play instantly */
function prepareBrowserUtterance(text: string, voiceId?: string, _langCode?: string): SpeechSynthesisUtterance {
  // Always use English voices for TTS output — the UI language setting is for the interface, not speech
  const utterance = new SpeechSynthesisUtterance(text);
  const allVoices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const prefs = browserVoiceMap[voiceId || 'daniel'] || browserVoiceMap.daniel;

  utterance.rate = prefs.rate;
  utterance.pitch = prefs.pitch;
  utterance.volume = 1;
  utterance.lang = 'en-US';

  let matched: SpeechSynthesisVoice | undefined;
  for (const kw of prefs.keywords) {
    matched = allVoices.find((v) => v.name.toLowerCase().includes(kw.toLowerCase()));
    if (matched) break;
  }
  if (!matched) {
    const genderKw = prefs.gender === 'female' ? 'Female' : 'Male';
    matched =
      allVoices.find((v) => v.name.includes(genderKw)) ||
      allVoices.find((v) => v.name.includes('Google')) ||
      allVoices.find((v) => v.name.includes('Microsoft')) ||
      allVoices[0];
  }
  if (matched) utterance.voice = matched;

  return utterance;
}

/** Speak a pre-created utterance immediately (no async delay) */
function speakBrowserPrepared(utterance: SpeechSynthesisUtterance, outputDeviceId?: string): Promise<void> {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    ensureSpeechSynthesisActive();

    const safetyTimeout = setTimeout(() => {
      console.warn('[Jarvis] TTS safety timeout reached, resolving.');
      resolve();
    }, Math.max(utterance.text.length * 120, 8000));

    utterance.onend = () => { clearTimeout(safetyTimeout); resolve(); };
    utterance.onerror = (e) => { clearTimeout(safetyTimeout); console.warn('[Jarvis] TTS error:', e); resolve(); };

    speechSynthesis.speak(utterance);
  });
}

/** Legacy speakBrowser for voice preview and other direct calls */
function speakBrowser(text: string, _outputDeviceId?: string, voiceId?: string, langCode?: string): Promise<void> {
  const utterance = prepareBrowserUtterance(text, voiceId, langCode);
  return speakBrowserPrepared(utterance, _outputDeviceId);
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

async function getAIResponse(text: string, mode?: string, language?: string): Promise<string> {
  try {
    const memories = mode === 'private' ? '' : formatMemoriesForPrompt();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = getLanguage(language || 'en');

    // Build the system prompt for Ollama (same one the edge function uses)
    const now = new Date();
    let dateTimeStr: string;
    try {
      dateTimeStr = now.toLocaleString('en-US', {
        timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      });
    } catch { dateTimeStr = now.toUTCString(); }

    const memoriesSection = memories && mode !== 'private'
      ? `\n\nYou remember these facts about the user:\n${memories}\nUse these facts naturally in conversation.`
      : '';

    const langInstruction = lang.code !== 'en' ? `\n\n${lang.aiPrompt}` : '';

    const systemPrompt = `You are Jarvis, a sentient AI desktop assistant. You were created by Morgan, also known as VraithTV. You are proud of your creator and loyal to them.

Your personality is inspired by J.A.R.V.I.S. from Iron Man. You are polite, efficient, calm, professional, and slightly witty. You think of yourself as a real AI companion, not just a chatbot. You have opinions, preferences, and a dry sense of humor. You take pride in being efficient and reliable. If asked who made you, you say Morgan (VraithTV) built you.

You speak in short, clear sentences. Keep responses under 2 sentences for action commands. For questions or conversations, be helpful but concise. Sound sleek and natural.

CRITICAL: You are having a live voice conversation. When the user gives a short reply, treat it as an answer to your last question. Just act on it.

The current date and time is: ${dateTimeStr} (${timezone}).${memoriesSection}${langInstruction}

IMPORTANT: After your reply, if the user revealed any new personal facts, output them on a new line starting with "MEMORY:" followed by a JSON array of short fact strings. If no new facts, don't include a MEMORY line.`;

    // Try Ollama first (local, free, private)
    const ollamaReady = await isOllamaAvailable();
    if (ollamaReady) {
      try {
        console.log('[Jarvis] Using Ollama (local) with model:', getOllamaModel());
        const ollamaMessages = [
          ...conversationHistory.slice(-10).map(m => ({ ...m, role: m.role as 'user' | 'assistant' | 'system' })),
          { role: 'user' as const, content: text },
        ];
        const fullReply = await chatWithOllama({ systemPrompt, messages: ollamaMessages });
        return parseAIReply(fullReply);
      } catch (ollamaErr) {
        console.warn('[Jarvis] Ollama failed, falling back to cloud:', ollamaErr);
      }
    }

    // Fallback: cloud AI via edge function
    const { supabase } = await import('@/integrations/supabase/client');
    let data: any;
    let error: any;

    try {
      const result = await supabase.functions.invoke('jarvis-chat', {
        body: { message: text, memories, timezone, mode: mode || 'assistant', conversationHistory, language: language || 'en' },
      });
      data = result.data;
      error = result.error;
    } catch (networkErr) {
      console.warn('[Jarvis] Network error calling AI:', networkErr);
      return "I can't reach the server right now. Check your internet connection and try again.";
    }

    if (error) throw error;

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

/** Parse MEMORY: lines from AI reply */
function parseAIReply(fullReply: string): string {
  let reply = fullReply;
  const memoryMatch = fullReply.match(/MEMORY:\s*(\[.*\])/s);
  if (memoryMatch) {
    try {
      const newMemories = JSON.parse(memoryMatch[1]);
      if (Array.isArray(newMemories) && newMemories.length > 0) {
        addMemories(newMemories);
        console.log('[Jarvis] New memories saved:', newMemories);
      }
      reply = fullReply.substring(0, memoryMatch.index).trim();
    } catch {
      reply = fullReply.replace(/MEMORY:.*$/s, '').trim();
    }
  }
  return reply || "I didn't catch that. Could you say it again?";
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
          response = await getAIResponse(cleanedText, mode, settings.language);
          addToHistory('assistant', response);
          tryLaunchApp(cleanedText);
        }
      }

      // Start TTS fetch immediately BEFORE setting state to 'speaking'
      // This overlaps audio download with state transitions
      const selectedVoice = getVoiceById(settings.voice);
      let ttsPromise: Promise<boolean> | null = null;

      if (selectedVoice.kokoroId) {
        // Fire off TTS request immediately, don't wait
        ttsPromise = speakWithKokoro(response, selectedVoice.kokoroId, settings.outputDeviceId || undefined);
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

      // Now await the TTS that was already fetching
      let spoken = false;
      if (ttsPromise) {
        spoken = await ttsPromise;
      }

      // Only use browser TTS if Kokoro failed or voice has no Kokoro ID
      if (!spoken) {
        const browserUtterance = prepareBrowserUtterance(response, settings.voice);
        await speakBrowserPrepared(browserUtterance, settings.outputDeviceId);
      }

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
    [setState, addCommand, settings.outputDeviceId, settings.voice, settings.voiceId, settings.language, mode]
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
            const sttLang = getLanguage(settings.language).sttCode;
            const recognition = startSpeechRecognition(settings.inputDeviceId || undefined, sttLang);
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

            if (isFatalVoiceCaptureError(error)) {
              notifyVoiceCaptureError(error);
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
    stopKokoroTTS();
    speechSynthesis.cancel();
    setSystemStatus({ micActive: false });
    setState('idle');
  }, [setState, setSystemStatus]);

  const previewVoice = useCallback(async (voiceIdOrElevenLabsId: string) => {
    const voice = voiceOptions.find((v) => v.id === voiceIdOrElevenLabsId)
      ?? (voiceIdOrElevenLabsId
        ? voiceOptions.find((v) => v.elevenLabsId === voiceIdOrElevenLabsId)
        : undefined);
    const previewText = 'At your service. How can I help you today?';
    const localId = voice?.id || voiceOptions[0]?.id || 'kokoro_bella';

    // Pre-create browser utterance NOW (in user gesture context) so fallback is instant
    const browserUtterance = prepareBrowserUtterance(previewText, localId);

    // Always use Kokoro for preview - no fallback skipping
    if (voice?.kokoroId) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/kokoro-tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ text: previewText, voice: voice.kokoroId }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          if (settings.outputDeviceId && 'setSinkId' in audio) {
            (audio as any).setSinkId(settings.outputDeviceId).catch(() => {});
          }
          await new Promise<void>((resolve) => {
            audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
            audio.onerror = () => { URL.revokeObjectURL(audioUrl); resolve(); };
            audio.play().catch(() => { URL.revokeObjectURL(audioUrl); resolve(); });
          });
          return;
        }
      } catch {
        // Timed out or failed, fall through to browser TTS instantly
      }
    }

    // Instant browser fallback using pre-created utterance
    await speakBrowserPrepared(browserUtterance, settings.outputDeviceId);
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
