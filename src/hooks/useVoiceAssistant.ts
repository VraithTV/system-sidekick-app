import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { supabase } from '@/integrations/supabase/client';
import { matchWakeWord } from '@/lib/fuzzyWake';

let elevenLabsRetryAfter = 0;

async function speakWithElevenLabs(text: string, voiceId: string): Promise<void> {
  if (Date.now() < elevenLabsRetryAfter) {
    return speakBrowser(text);
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

      return speakBrowser(text);
    }

    elevenLabsRetryAfter = 0;

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = async () => {
        URL.revokeObjectURL(audioUrl);
        await speakBrowser(text);
        resolve();
      };
      audio.play().catch(async () => {
        URL.revokeObjectURL(audioUrl);
        await speakBrowser(text);
        resolve();
      });
    });
  } catch (e) {
    console.warn('ElevenLabs error, falling back:', e);
    elevenLabsRetryAfter = Date.now() + 5 * 60 * 1000;
    return speakBrowser(text);
  }
}

function speakBrowser(text: string): Promise<void> {
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
    const { data, error } = await supabase.functions.invoke('jarvis-chat', {
      body: { message: text },
    });
    if (error) throw error;
    return data?.reply || "I didn't catch that. Could you say it again?";
  } catch (e) {
    console.error('AI response error:', e);
    return "I'm having trouble connecting right now. Please try again.";
  }
}

export function useVoiceAssistant() {
  const { setState, addCommand, settings } = useJarvisStore();
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const wakeWordHeard = useRef(false);

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

      await speakWithElevenLabs(response, settings.voiceId);
      setState('idle');
    },
    [setState, addCommand, settings.voiceId]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = async (event: any) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;

      const transcript = last[0].transcript.trim();
      const lower = transcript.toLowerCase();
      const wakeName = settings.wakeName.toLowerCase();

      const prefixPattern = new RegExp(
        `^(?:hey|hi|hello|ok|okay|yo)?[,\\s]*${wakeName}[,\\s]*(.*)$`,
        'i'
      );
      const match = lower.match(prefixPattern);

      if (!wakeWordHeard.current) {
        if (match) {
          const commandAfter = match[1]?.trim();
          if (commandAfter && commandAfter.length > 2) {
            await processCommand(commandAfter);
          } else {
            wakeWordHeard.current = true;
            setState('listening');
            setTimeout(() => {
              if (wakeWordHeard.current) {
                wakeWordHeard.current = false;
                setState('idle');
              }
            }, 10000);
          }
        }
      } else {
        wakeWordHeard.current = false;
        await processCommand(lower);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setState('idle');
        return;
      }
      setTimeout(() => {
        if (isListeningRef.current) startListening();
      }, 1000);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 100);
      }
    };

    try {
      recognition.start();
      isListeningRef.current = true;
    } catch (e) {
      console.warn('Failed to start recognition:', e);
    }
  }, [settings.wakeName, setState, processCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setState('idle');
  }, [setState]);

  const previewVoice = useCallback(async (voiceId: string) => {
    await speakWithElevenLabs('At your service. How can I help you today?', voiceId);
  }, []);

  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  return { startListening, stopListening, previewVoice };
}
