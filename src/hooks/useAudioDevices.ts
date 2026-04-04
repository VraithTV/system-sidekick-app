import { useState, useEffect, useCallback } from 'react';

export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export function useAudioDevices() {
  const [inputs, setInputs] = useState<AudioDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<AudioDeviceInfo[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const enumerate = useCallback(async () => {
    try {
      // Request permission first so labels are populated
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setHasPermission(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      setInputs(
        devices
          .filter((d) => d.kind === 'audioinput' && d.deviceId)
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 6)}`, kind: 'audioinput' }))
      );
      setOutputs(
        devices
          .filter((d) => d.kind === 'audiooutput' && d.deviceId)
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 6)}`, kind: 'audiooutput' }))
      );
    } catch (e) {
      console.warn('Could not enumerate audio devices:', e);
    }
  }, []);

  useEffect(() => {
    enumerate();
    navigator.mediaDevices?.addEventListener('devicechange', enumerate);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', enumerate);
  }, [enumerate]);

  return { inputs, outputs, hasPermission, refresh: enumerate };
}