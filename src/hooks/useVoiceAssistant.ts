import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { supabase } from '@/integrations/supabase/client';

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    const voices = speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find((v) => v.lang.startsWith('en-') && v.name.includes('Male')) ||
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

      await speak(response);
      setState('idle');
    },
    [setState, addCommand]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
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

      const transcript = last[0].transcript.trim().toLowerCase();
      const wakeName = settings.wakeName.toLowerCase();

      if (!wakeWordHeard.current) {
        if (transcript.includes(wakeName)) {
          wakeWordHeard.current = true;
          const afterWake = transcript.split(wakeName).pop()?.trim();
          if (afterWake && afterWake.length > 2) {
            wakeWordHeard.current = false;
            await processCommand(afterWake);
          } else {
            setState('listening');
            setTimeout(() => {
              if (wakeWordHeard.current) {
                wakeWordHeard.current = false;
                setState('idle');
              }
            }, 8000);
          }
        }
      } else {
        wakeWordHeard.current = false;
        await processCommand(transcript);
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

  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  return { startListening, stopListening };
}
