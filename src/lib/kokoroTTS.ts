/**
 * Kokoro TTS client - speaks text using a self-hosted Kokoro server via edge function.
 * Always attempts Kokoro - no backoff or fallback skipping.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentAudio: HTMLAudioElement | null = null;
let warmupPromise: Promise<void> | null = null;
let lastWarmVoice = '';
let lastWarmAt = 0;

export interface KokoroCancelToken {
  cancelled: boolean;
  controller: AbortController | null;
}

/** Always available - no offline tracking */
export function isKokoroAvailable(): boolean {
  return true;
}

function clearCurrentAudio(audio?: HTMLAudioElement) {
  const target = audio ?? currentAudio;
  if (!target) return;

  target.pause();
  target.src = '';
  target.load();

  if (!audio || currentAudio === audio) {
    currentAudio = null;
  }
}

export function stopKokoroTTS() {
  clearCurrentAudio();
}

/** Create a cancellation token that can be passed to speakWithKokoro */
export function createCancelToken(): KokoroCancelToken {
  return { cancelled: false, controller: null };
}

/** Mark a token as cancelled so in-flight speakWithKokoro calls abort before playing */
export function cancelToken(token: KokoroCancelToken) {
  token.cancelled = true;
  token.controller?.abort();
}

/** Warm the Kokoro backend in the background so the next real response starts faster */
export async function warmKokoroVoice(voice = 'af_bella'): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  const voiceId = voice || 'af_bella';
  const now = Date.now();

  if (warmupPromise && lastWarmVoice === voiceId) return warmupPromise;
  if (lastWarmVoice === voiceId && now - lastWarmAt < 20000) return;

  lastWarmVoice = voiceId;
  lastWarmAt = now;

  warmupPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/kokoro-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text: '.', voice: voiceId }),
        signal: controller.signal,
      });

      if (response.body) {
        try {
          await response.body.cancel();
        } catch {
          // Ignore cancel errors on warmup requests
        }
      }
    } catch {
      // Ignore warmup failures - this is only an optimization.
    } finally {
      clearTimeout(timeout);
      warmupPromise = null;
    }
  })();

  await warmupPromise;
}

function createKokoroStreamUrl(text: string, voice: string) {
  if (!SUPABASE_URL) return '';

  const url = new URL(`${SUPABASE_URL}/functions/v1/kokoro-tts`);
  url.searchParams.set('text', text);
  url.searchParams.set('voice', voice || 'af_bella');
  return url.toString();
}

export async function speakWithKokoro(
  text: string,
  voice?: string,
  outputDeviceId?: string,
  token?: KokoroCancelToken,
): Promise<boolean> {
  if (!SUPABASE_URL) return false;
  if (token?.cancelled) return false;

  try {
    const audioUrl = createKokoroStreamUrl(text, voice || 'af_bella');
    if (!audioUrl) return false;

    return await new Promise<boolean>((resolve) => {
      const controller = new AbortController();
      if (token) token.controller = controller;

      const audio = new Audio();
      currentAudio = audio;
      audio.preload = 'auto';

      let settled = false;
      const startTimeout = setTimeout(() => controller.abort(), 8000);

      const finish = (result: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(startTimeout);
        controller.signal.removeEventListener('abort', handleAbort);
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        clearCurrentAudio(audio);
        resolve(result);
      };

      const handleAbort = () => finish(false);
      controller.signal.addEventListener('abort', handleAbort, { once: true });

      if (outputDeviceId && 'setSinkId' in audio) {
        (audio as any).setSinkId(outputDeviceId).catch(() => {});
      }

      audio.onplaying = () => {
        clearTimeout(startTimeout);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);

      if (token?.cancelled) {
        controller.abort();
        return;
      }

      audio.src = audioUrl;
      audio.play().catch(() => finish(false));
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
