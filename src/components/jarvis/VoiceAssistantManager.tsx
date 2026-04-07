import { useEffect } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

export const VoiceAssistantManager = () => {
  const { settings, systemStatus, setSystemStatus } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();

  useEffect(() => {
    if (settings.alwaysListening) {
      setSystemStatus({ micActive: true });
    }
  }, [settings.alwaysListening, setSystemStatus]);

  useEffect(() => {
    if (systemStatus.micActive) {
      startListening();
      return;
    }

    stopListening();
  }, [systemStatus.micActive, startListening, stopListening]);

  return null;
};
