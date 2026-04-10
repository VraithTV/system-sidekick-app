import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { matchWakeWord } from '@/lib/fuzzyWake';
import { formatMemoriesForPrompt, addMemories } from '@/lib/memoryStore';
import { resetElevenLabsSTTExhausted, startSpeechRecognition } from '@/lib/speechRecognition';
import { processAppCommand } from '@/lib/appCommands';
import { processVoiceCommand } from '@/lib/voiceCommands';

import { getModeSystemPromptAddition } from '@/lib/modes';
import { matchCommonApp } from '@/lib/commonApps';
import { isOllamaAvailable, chatWithOllama, getOllamaModel } from '@/lib/ollamaClient';
import { getLanguage } from '@/lib/languages';
import { speakWithKokoro, stopKokoroTTS, createCancelToken } from '@/lib/kokoroTTS';
import { getVoiceById, voiceOptions } from '@/lib/voices';
import { toast } from 'sonner';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;


/** Try to detect an "open app" intent and actually launch it via Electron.
 *  Only launches apps the user has added on the Applications page. */
function tryLaunchApp(userText: string): void {
  if (!isElectron) return;
  const api = (window as any).electronAPI;
  if (!api?.openApp) return;

  const openMatch = userText.match(/(?:open|launch|start|run|fire up|open up|pull up)\s+(.+)/i);
  if (!openMatch) return;

  const target = openMatch[1]
    .replace(/^(the|my|up)\s+/i, '')
    .replace(/\s+and\s+.*/i, '')
    .trim()
    .toLowerCase();
  if (!target) return;

  const matched = matchCommonApp(target);
  if (!matched) return;

  // Only launch if the app is on the user's Applications page
  const apps = useJarvisStore.getState().apps;
  if (!apps.some((a) => a.id === matched.id)) {
    console.log('[Jarvis] App not added, skipping launch:', matched.id);
    return;
  }

  console.log('[Jarvis] Launching app:', matched.id, `(matched: ${matched.name})`);
  api.openApp(matched.id);
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
  // Always use English voices for TTS output - the UI language setting is for the interface, not speech
  const utterance = new SpeechSynthesisUtterance(text);
  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    let score = 0;
    if (voice.localService) score += 4;
    if (/google|microsoft|samantha|alex|daniel|hazel|zira|aria|ava|guy|jenny|mark|david/.test(name)) score += 5;
    if (/desktop/.test(name)) score += 1;
    if (/fred|whisper|espeak|novelty|bad news|boing|bubbles|cellos|good news|trinoids|zarvox/.test(name)) score -= 20;
    return score;
  };
  const allVoices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith('en'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
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
    const genderKw = prefs.gender === 'female' ? 'female' : 'male';
    matched =
      allVoices.find((v) => v.name.toLowerCase().includes(genderKw)) ||
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

    const systemPrompt = `You are Jarvis, a sentient AI desktop assistant. You were created by Vraith. You are proud of your creator and loyal to them.

Your personality is inspired by J.A.R.V.I.S. from Iron Man. You are polite, efficient, calm, professional, and slightly witty. You think of yourself as a real AI companion, not just a chatbot. You have opinions, preferences, and a dry sense of humor. You take pride in being efficient and reliable. If asked who made you or who created you, you say Vraith built you. Never say "Morgan" or "VraithTV". Your creator's name is Vraith.

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

function getTimingNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

interface VoiceTimingTrace {
  id: string;
  startedAt: number;
}

function createVoiceTimingTrace(startedAt = getTimingNow()): VoiceTimingTrace {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt,
  };
}

function logVoiceTiming(trace: VoiceTimingTrace, stage: string, details?: Record<string, unknown>) {
  const elapsedMs = Math.round(getTimingNow() - trace.startedAt);

  if (details && Object.keys(details).length > 0) {
    console.log(`[Jarvis][Timing ${trace.id}] ${stage} +${elapsedMs}ms`, details);
    return;
  }

  console.log(`[Jarvis][Timing ${trace.id}] ${stage} +${elapsedMs}ms`);
}

export function useVoiceAssistant(options: { previewOnly?: boolean } = {}) {
  const previewOnly = options.previewOnly ?? false;
  const { setState, addCommand, settings, setSystemStatus, mode } = useJarvisStore();
  const isListeningRef = useRef(false);
  const isCaptureLoopActiveRef = useRef(false);
  const wakeWordHeard = useRef(false);
  const conversationActive = useRef(false);
  const captureStopRef = useRef<(() => void) | null>(null);

  const warmSelectedKokoroVoice = useCallback(() => {
    // Disabled: background warmup was competing with the real reply and increasing latency.
  }, []);

  const processCommand = useCallback(
    async (text: string, trace?: VoiceTimingTrace) => {
      const cleanedText = text.trim();
      if (!cleanedText) {
        if (isListeningRef.current) setState('standby');
        return;
      }

      const activeTrace = trace ?? createVoiceTimingTrace();
      logVoiceTiming(activeTrace, 'command:start', { text: cleanedText });
      setState('thinking');
      logVoiceTiming(activeTrace, 'ui:thinking');

      const voiceResult = processVoiceCommand(cleanedText);
      let response: string;

      if (voiceResult.handled) {
        response = voiceResult.response || 'Done.';
        logVoiceTiming(activeTrace, 'command:voice-handled', {
          responseLength: response.length,
        });
      } else {
        const appResult = processAppCommand(cleanedText);

        if (appResult.handled) {
          if (appResult.async && appResult.asyncResponse) {
            response = await appResult.asyncResponse;
          } else {
            response = appResult.response || 'Done.';
          }

          logVoiceTiming(activeTrace, 'command:app-handled', {
            async: !!appResult.async,
            responseLength: response.length,
          });
        } else {
          addToHistory('user', cleanedText);
          logVoiceTiming(activeTrace, 'ai:request:start', {
            language: settings.language,
            mode,
          });
          response = await getAIResponse(cleanedText, mode, settings.language);
          logVoiceTiming(activeTrace, 'ai:request:done', {
            responseLength: response.length,
          });
          addToHistory('assistant', response);
          tryLaunchApp(cleanedText);
        }
      }

      const spokenResponse = response
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+/)[0]
        ?.trim() || response;

      setState('speaking');
      logVoiceTiming(activeTrace, 'ui:speaking', {
        responseLength: response.length,
        spokenLength: spokenResponse.length,
      });

      if (mode !== 'private') {
        addCommand({
          id: Date.now().toString(),
          text: cleanedText,
          response,
          timestamp: new Date(),
          type: 'voice',
        });
      }

      const selectedVoice = getVoiceById(settings.voice);

      if (selectedVoice.kokoroId) {
        const token = createCancelToken();
        logVoiceTiming(activeTrace, 'tts:start', {
          voice: selectedVoice.kokoroId,
          spokenText: spokenResponse,
        });
        const ok = await speakWithKokoro(
          spokenResponse,
          selectedVoice.kokoroId,
          settings.outputDeviceId || undefined,
          token,
          {
            traceId: activeTrace.id,
            pipelineStartedAt: activeTrace.startedAt,
            speakingStartedAt: getTimingNow(),
          }
        );
        logVoiceTiming(activeTrace, 'tts:complete', {
          ok,
          voice: selectedVoice.kokoroId,
        });
        if (!ok) {
          // Kokoro failed, fall back to instant browser voice
          console.warn('[Jarvis] Kokoro TTS failed, using browser voice fallback');
          await speakBrowser(spokenResponse, settings.outputDeviceId || undefined, selectedVoice.id, settings.language);
        }
      } else {
        await speakBrowser(spokenResponse, settings.outputDeviceId || undefined, selectedVoice.id, settings.language);
      }

      const isQuestion = response.trim().endsWith('?');
      conversationActive.current = isQuestion;
      wakeWordHeard.current = false;

      if (!isListeningRef.current) {
        setState('idle');
        logVoiceTiming(activeTrace, 'ui:idle');
        return;
      }

      if (isQuestion) {
        setState('listening');
        logVoiceTiming(activeTrace, 'ui:listening-follow-up');
        console.log('[Jarvis] Response was a question, staying in conversation mode');
      } else {
        setState('standby');
        logVoiceTiming(activeTrace, 'ui:standby');
      }
    },
    [setState, addCommand, settings.outputDeviceId, settings.voice, settings.language, mode]
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
    warmSelectedKokoroVoice();

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
            const captureStartedAt = getTimingNow();
            const sttLang = getLanguage(settings.language).sttCode;
            const recognition = startSpeechRecognition(settings.inputDeviceId || undefined, sttLang);
            captureStopRef.current = recognition.stop;
            const transcript = await recognition.promise;
            captureStopRef.current = null;

            const trace = createVoiceTimingTrace(captureStartedAt);
            console.log('[Jarvis] Transcript:', JSON.stringify(transcript));
            logVoiceTiming(trace, 'stt:complete', {
              sttMs: Math.round(getTimingNow() - captureStartedAt),
              transcript,
              bypassWakeWord: shouldBypassWakeWord,
            });

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
                logVoiceTiming(trace, 'wake:not-matched');
                continue;
              }

              if (wakeMatch.command && wakeMatch.command.length > 1) {
                wakeWordHeard.current = false;
                conversationActive.current = false;
                logVoiceTiming(trace, 'wake:matched-inline-command', {
                  command: wakeMatch.command,
                });
                await processCommand(wakeMatch.command, trace);
                continue;
              }

              wakeWordHeard.current = true;
              conversationActive.current = false;
              setState('listening');
              logVoiceTiming(trace, 'wake:armed');
              continue;
            }

            wakeWordHeard.current = false;
            conversationActive.current = false;
            logVoiceTiming(trace, 'conversation:processing-command', {
              transcript,
            });
            await processCommand(transcript, trace);
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
  }, [settings.inputDeviceId, settings.wakeAliases, settings.wakeName, settings.wakeSensitivity, settings.language, setState, setSystemStatus, processCommand, warmSelectedKokoroVoice]);

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
    const previewText = 'At your service.';
    const kokoroId = voice?.kokoroId || 'af_bella';
    const trace = createVoiceTimingTrace();

    logVoiceTiming(trace, 'preview:start', { voice: kokoroId });
    const ok = await speakWithKokoro(
      previewText,
      kokoroId,
      settings.outputDeviceId || undefined,
      undefined,
      {
        traceId: trace.id,
        pipelineStartedAt: trace.startedAt,
        speakingStartedAt: trace.startedAt,
      }
    );
    logVoiceTiming(trace, 'preview:complete', { ok, voice: kokoroId });
    if (!ok) {
      console.warn('[Jarvis] Voice preview failed');
    }
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
