import { useEffect, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

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

  return null;
};
