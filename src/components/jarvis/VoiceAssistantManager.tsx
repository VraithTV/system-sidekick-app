import { useEffect, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import {
  VOICE_ASSISTANT_START_EVENT,
  VOICE_ASSISTANT_STOP_EVENT,
  useVoiceAssistant,
} from '@/hooks/useVoiceAssistant';
import { checkElevenLabsHealth, isElevenLabsCreditsExhausted } from '@/lib/elevenLabsTTS';
import { toast } from 'sonner';

export const VoiceAssistantManager = () => {
  const { settings, systemStatus, setSystemStatus } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const startRef = useRef(startListening);
  const stopRef = useRef(stopListening);

  // Keep refs current without triggering effects
  startRef.current = startListening;
  stopRef.current = stopListening;

  // Boot-time ElevenLabs health check
  useEffect(() => {
    checkElevenLabsHealth().then((healthy) => {
      if (!healthy && isElevenLabsCreditsExhausted()) {
        toast.warning('Voice credits have run out.', {
          description: 'Jarvis will use the built-in voice until credits are added.',
          duration: 8000,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (settings.alwaysListening) {
      setSystemStatus({ micActive: true });
    }
  }, [settings.alwaysListening, setSystemStatus]);

  useEffect(() => {
    if (systemStatus.micActive) {
      startRef.current();
    } else {
      stopRef.current();
    }
  }, [systemStatus.micActive]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStart = () => startRef.current();
    const handleStop = () => stopRef.current();

    window.addEventListener(VOICE_ASSISTANT_START_EVENT, handleStart);
    window.addEventListener(VOICE_ASSISTANT_STOP_EVENT, handleStop);

    return () => {
      window.removeEventListener(VOICE_ASSISTANT_START_EVENT, handleStart);
      window.removeEventListener(VOICE_ASSISTANT_STOP_EVENT, handleStop);
    };
  }, []);

  return null;
};
