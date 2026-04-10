import { useEffect, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import {
  VOICE_ASSISTANT_START_EVENT,
  VOICE_ASSISTANT_STOP_EVENT,
  useVoiceAssistant,
} from '@/hooks/useVoiceAssistant';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
const ELECTRON_MIC_PRIMED_KEY = 'jarvis_electron_mic_primed';

function hasElectronMicPrimed() {
  if (typeof window === 'undefined' || !isElectron) return true;
  try {
    return window.localStorage.getItem(ELECTRON_MIC_PRIMED_KEY) === '1';
  } catch {
    return false;
  }
}

export const VoiceAssistantManager = () => {
  const { settings, systemStatus, setSystemStatus } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const startRef = useRef(startListening);
  const stopRef = useRef(stopListening);

  startRef.current = startListening;
  stopRef.current = stopListening;

  useEffect(() => {
    if (!settings.alwaysListening) return;
    // In browser (non-Electron), don't auto-start mic - it requires a user gesture.
    // The user must click the "Enable Microphone" button on the dashboard.
    if (!isElectron) return;
    if (!hasElectronMicPrimed()) return;
    setSystemStatus({ micActive: true });
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
