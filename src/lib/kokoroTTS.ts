/**
 * Kokoro TTS client - speaks text using a self-hosted Kokoro server via edge function.
 * Always attempts Kokoro - no backoff or fallback skipping.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentAudio: HTMLAudioElement | null = null;
let cancelledToken: object | null = null;

/** Create a cancellation token that can be passed to speakWithKokoro */
export function createCancelToken(): object { return {}; }

/** Mark a token as cancelled so in-flight speakWithKokoro calls abort before playing */
export function cancelToken(token: object) { cancelledToken = token; }

/** Always available - no offline tracking */
export function isKokoroAvailable(): boolean {
  return true;
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
  token?: object,
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

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
      return false;
    }

    // Check if cancelled before decoding audio
    if (token && token === cancelledToken) return false;

    // Use blob approach for immediate playback
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Check again after blob decode
    if (token && token === cancelledToken) {
      URL.revokeObjectURL(audioUrl);
      return false;
    }

    return await new Promise<boolean>((resolve) => {
      const audio = new Audio();
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

      // Set src and play as fast as possible
      audio.src = audioUrl;
      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve(false);
      });
    });
  } catch (err) {
    console.warn('[Jarvis] Kokoro TTS failed:', err);
    return false;
  }
}
