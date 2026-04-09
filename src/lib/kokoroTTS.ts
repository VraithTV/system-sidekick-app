/**
 * Kokoro TTS client - speaks text using a self-hosted Kokoro server via edge function.
 * Falls back gracefully so callers can try the next TTS provider.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentAudio: HTMLAudioElement | null = null;

/** Session flag: if Kokoro is unreachable, skip it for 60s */
let kokoroOfflineUntil = 0;

export function isKokoroAvailable(): boolean {
  return Date.now() >= kokoroOfflineUntil;
}

export function stopKokoroTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

export async function speakWithKokoro(
  text: string,
  voice?: string,
  outputDeviceId?: string,
): Promise<boolean> {
  if (!isKokoroAvailable()) return false;
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/kokoro-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text, voice: voice || 'af_bella' }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.warn('[Jarvis] Kokoro TTS error:', response.status, errorData);

      // If server is down or not configured, back off for 60s
      if (response.status >= 500 || response.status === 504) {
        kokoroOfflineUntil = Date.now() + 60_000;
      }

      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return await new Promise<boolean>((resolve) => {
      const audio = new Audio(audioUrl);
      currentAudio = audio;

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
    console.warn('[Jarvis] Kokoro TTS failed:', err);
    kokoroOfflineUntil = Date.now() + 60_000;
    return false;
  }
}
