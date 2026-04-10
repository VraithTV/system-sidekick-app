/**
 * Kokoro TTS client - speaks text using a self-hosted Kokoro server via edge function.
 * Always attempts Kokoro - no backoff or fallback skipping.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentAudio: HTMLAudioElement | null = null;

export interface KokoroCancelToken {
  cancelled: boolean;
  controller: AbortController | null;
}

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

export function createCancelToken(): KokoroCancelToken {
  return { cancelled: false, controller: null };
}

export function cancelToken(token: KokoroCancelToken) {
  token.cancelled = true;
  token.controller?.abort();
}

export async function speakWithKokoro(
  text: string,
  voice?: string,
  outputDeviceId?: string,
  token?: KokoroCancelToken,
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  try {
    const controller = new AbortController();
    if (token) token.controller = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);

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

    if (token?.cancelled) return false;

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (token?.cancelled) {
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

      audio.src = audioUrl;
      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve(false);
      });
    });
  } catch (err) {
    if (token?.cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
      return false;
    }
    console.warn('[Jarvis] Kokoro TTS failed:', err);
    return false;
  } finally {
    if (token) token.controller = null;
  }
}
