/**
 * ElevenLabs TTS client - speaks text using the ElevenLabs API via edge function.
 * Falls back to browser speechSynthesis if the API call fails.
 * Tracks credit/quota status so the app can notify users on boot.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentAudio: HTMLAudioElement | null = null;

/** Persistent flag: once we detect credits are gone, remember it for the session */
let creditsExhausted = false;

/** Whether we've already done the boot-time health check */
let healthChecked = false;

export function isElevenLabsCreditsExhausted(): boolean {
  return creditsExhausted;
}

export function stopElevenLabsTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

/**
 * Quick health check: sends a tiny request to see if ElevenLabs responds.
 * Returns true if ElevenLabs is working, false if credits are gone or unavailable.
 */
export async function checkElevenLabsHealth(): Promise<boolean> {
  if (healthChecked) return !creditsExhausted;
  healthChecked = true;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    creditsExhausted = true;
    return false;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text: 'test', voiceId: 'onwK4e9ZLuTAKqWW03F9' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const code = errorData?.code;
      if (
        code === 'quota_exceeded' ||
        code === 'detected_unusual_activity' ||
        code === 'missing_permissions' ||
        errorData?.fallback === 'browser_tts'
      ) {
        creditsExhausted = true;
        console.warn('[Jarvis] ElevenLabs credits exhausted or blocked. Using browser TTS.');
        return false;
      }
      console.warn('[Jarvis] ElevenLabs TTS error:', response.status, errorData);
      return false;
    }

    // Success - discard the audio blob
    await response.blob();
    creditsExhausted = false;
    return true;
  } catch (err) {
    console.warn('[Jarvis] ElevenLabs health check failed:', err);
    return false;
  }
}

export async function speakWithElevenLabs(
  text: string,
  voiceId?: string,
  outputDeviceId?: string,
): Promise<boolean> {
  // If we already know credits are gone, skip immediately
  if (creditsExhausted) return false;

  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: voiceId || 'onwK4e9ZLuTAKqWW03F9' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const code = errorData?.code;

      // Mark credits as exhausted for quota/block errors
      if (
        code === 'quota_exceeded' ||
        code === 'detected_unusual_activity' ||
        code === 'missing_permissions'
      ) {
        creditsExhausted = true;
        console.warn('[Jarvis] ElevenLabs credits exhausted. Switching to browser TTS for this session.');
      }

      if (errorData?.fallback === 'browser_tts') {
        console.warn('[Jarvis] ElevenLabs TTS unavailable, falling back to browser TTS');
        return false;
      }
      console.warn('[Jarvis] ElevenLabs TTS error:', response.status, errorData);
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return await new Promise<boolean>((resolve) => {
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      // Try to set output device if supported
      if (outputDeviceId && 'setSinkId' in audio) {
        (audio as any).setSinkId(outputDeviceId).catch(() => {});
      }

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve(false);
      };

      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve(false);
      });
    });
  } catch (err) {
    console.warn('[Jarvis] ElevenLabs TTS failed:', err);
    return false;
  }
}
