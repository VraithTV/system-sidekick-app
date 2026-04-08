import { useEffect, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import {
  VOICE_ASSISTANT_START_EVENT,
  VOICE_ASSISTANT_STOP_EVENT,
  useVoiceAssistant,
} from '@/hooks/useVoiceAssistant';

export const VoiceAssistantManager = () => {
  const { settings, systemStatus, setSystemStatus } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const startRef = useRef(startListening);
  const stopRef = useRef(stopListening);

  // Keep refs current without triggering effects
  startRef.current = startListening;
  stopRef.current = stopListening;

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
