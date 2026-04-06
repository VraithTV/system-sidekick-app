import { useEffect } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import type { Clip } from '@/types/jarvis';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/**
 * Listens for global keyboard shortcuts from Electron
 * and dispatches the appropriate store actions.
 */
export function useGlobalShortcuts() {
  const { settings, addClip, setSystemStatus, systemStatus } = useJarvisStore();

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    if (!api?.onShortcut) return;

    api.onShortcut((action: string) => {
      switch (action) {
        case 'toggle-mic':
          setSystemStatus({ micActive: !systemStatus.micActive });
          break;
        case 'toggle-recording':
          setSystemStatus({ isRecording: !systemStatus.isRecording });
          break;
        case 'clip-now': {
          const clip: Clip = {
            id: Date.now().toString(),
            filename: `Clip_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`,
            duration: settings.clipDuration,
            timestamp: new Date(),
            size: `${(settings.clipDuration * 2.5).toFixed(1)} MB`,
          };
          addClip(clip);
          break;
        }
        case 'push-to-talk':
          // Handled by voice assistant hook
          break;
      }
    });
  }, [settings.clipDuration, systemStatus.micActive, systemStatus.isRecording]);
}
