import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { supabase } from '@/integrations/supabase/client';
import { matchWakeWord } from '@/lib/fuzzyWake';
import { startUtteranceCapture } from '@/lib/captureUtterance';
import { formatMemoriesForPrompt, addMemories } from '@/lib/memoryStore';

let elevenLabsRetryAfter = 0;

async function speakWithElevenLabs(text: string, voiceId: string, outputDeviceId?: string): Promise<void> {
  if (Date.now() < elevenLabsRetryAfter) {
    return speakBrowser(text, outputDeviceId);
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('ElevenLabs TTS unavailable, falling back to browser TTS:', errorText);

      if ([401, 402, 403, 429, 500, 502, 503].includes(response.status)) {
        elevenLabsRetryAfter = Date.now() + 5 * 60 * 1000;
      }

      return speakBrowser(text, outputDeviceId);
    }

    elevenLabsRetryAfter = 0;

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    // Route to selected output device if supported
    if (outputDeviceId && typeof (audio as any).setSinkId === 'function') {
      try { await (audio as any).setSinkId(outputDeviceId); } catch {}
    }

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = async () => {
        URL.revokeObjectURL(audioUrl);
        await speakBrowser(text, outputDeviceId);
        resolve();
      };
      audio.play().catch(async () => {
        URL.revokeObjectURL(audioUrl);
        await speakBrowser(text, outputDeviceId);
        resolve();
      });
    });
  } catch (e) {
    console.warn('ElevenLabs error, falling back:', e);
    elevenLabsRetryAfter = Date.now() + 5 * 60 * 1000;
    return speakBrowser(text, outputDeviceId);
  }
}

function speakBrowser(text: string, _outputDeviceId?: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    const voices = speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

async function getAIResponse(text: string): Promise<string> {
  try {
    const memories = formatMemoriesForPrompt();
    const { data, error } = await supabase.functions.invoke('jarvis-chat', {
      body: { message: text, memories },
    });
    if (error) throw error;

    // Store any new memories the AI extracted
    if (data?.newMemories && Array.isArray(data.newMemories) && data.newMemories.length > 0) {
      addMemories(data.newMemories);
      console.log('[Jarvis] New memories saved:', data.newMemories);
    }

    return data?.reply || "I didn't catch that. Could you say it again?";
  } catch (e) {
    console.error('AI response error:', e);
    return "I'm having trouble connecting right now. Please try again.";
  }
}

export function useVoiceAssistant() {
  const { setState, addCommand, settings, setSystemStatus } = useJarvisStore();
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const wakeWordHeard = useRef(false);
  const captureStopRef = useRef<(() => void) | null>(null);

  const processCommand = useCallback(
    async (text: string) => {
      setState('thinking');

      const response = await getAIResponse(text);

      setState('speaking');
      addCommand({
        id: Date.now().toString(),
        text,
        response,
        timestamp: new Date(),
        type: 'voice',
      });

      await speakWithElevenLabs(response, settings.voiceId, settings.outputDeviceId || undefined);
      setState('standby');
    },
    [setState, addCommand, settings.voiceId, settings.outputDeviceId]
  );

  const startListening = useCallback(() => {
    isListeningRef.current = true;
    setState('standby');
    setSystemStatus({ micActive: true });

    const runCaptureLoop = async () => {
      while (isListeningRef.current) {
        try {
          console.log('[Jarvis] Starting audio capture...');
          const controller = await startUtteranceCapture({
            deviceId: settings.inputDeviceId || undefined,
            maxDurationMs: wakeWordHeard.current ? 9000 : 7000,
            silenceDurationMs: wakeWordHeard.current ? 900 : 1200,
            levelThreshold: 8,
          });
          captureStopRef.current = controller.stop;
          const blob = await controller.promise;
          captureStopRef.current = null;

          console.log('[Jarvis] Capture complete, blob:', blob ? `${blob.size} bytes` : 'null');
          if (!blob || blob.size < 4000 || !isListeningRef.current) {
            console.log('[Jarvis] Skipped — too small or stopped');
            continue;
          }

          console.log('[Jarvis] Sending to transcription...');
          const formData = new FormData();
          formData.append('audio', new File([blob], 'utterance.webm', { type: blob.type || 'audio/webm' }));

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
            {
              method: 'POST',
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.warn('[Jarvis] Transcription failed:', response.status, errorText);
            continue;
          }

          const data = await response.json();
          const transcript = typeof data?.text === 'string' ? data.text.trim() : '';
          console.log('[Jarvis] Transcript:', JSON.stringify(transcript));
          if (!transcript) continue;

          if (!wakeWordHeard.current) {
            const wakeMatch = matchWakeWord(
              transcript,
              settings.wakeName,
              settings.wakeAliases,
              settings.wakeSensitivity
            );

            if (!wakeMatch.matched) {
              continue;
            }

            if (wakeMatch.command && wakeMatch.command.length > 2) {
              await processCommand(wakeMatch.command);
              wakeWordHeard.current = false;
              if (isListeningRef.current) setState('standby');
              continue;
            }

            wakeWordHeard.current = true;
            setState('listening');
            continue;
          }

          wakeWordHeard.current = false;
          await processCommand(transcript.toLowerCase());
          if (isListeningRef.current) setState('listening');
        } catch (error) {
          console.warn('[Jarvis] Voice capture loop error:', error);
          wakeWordHeard.current = false;
          if (!isListeningRef.current) break;
        }
      }
    };

    runCaptureLoop();
  }, [settings.inputDeviceId, settings.wakeAliases, settings.wakeName, settings.wakeSensitivity, setState, setSystemStatus, processCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    wakeWordHeard.current = false;
    captureStopRef.current?.();
    captureStopRef.current = null;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setSystemStatus({ micActive: false });
    setState('idle');
  }, [setState, setSystemStatus]);

  const previewVoice = useCallback(async (voiceId: string) => {
    await speakWithElevenLabs('At your service. How can I help you today?', voiceId, settings.outputDeviceId || undefined);
  }, [settings.outputDeviceId]);

  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  return { startListening, stopListening, previewVoice };
}
