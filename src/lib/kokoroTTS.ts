/**
 * Kokoro TTS client - speaks text using a locally hosted Kokoro server.
 * Calls localhost:8880 directly (no edge function proxy).
 */

const KOKORO_LOCAL_URL = 'http://localhost:8880/v1/audio/speech';

let currentAudio: HTMLAudioElement | null = null;

export interface KokoroCancelToken {
  cancelled: boolean;
  controller: AbortController | null;
}

export interface KokoroTimingTrace {
  traceId: string;
  pipelineStartedAt: number;
  speakingStartedAt: number;
}

function getTimingNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function logKokoroTiming(
  trace: KokoroTimingTrace | undefined,
  stage: string,
  details?: Record<string, unknown>,
) {
  if (!trace) return;
  const now = getTimingNow();
  const payload: Record<string, unknown> = {
    ...(details || {}),
    totalMs: Math.round(now - trace.pipelineStartedAt),
    speakingMs: Math.round(now - trace.speakingStartedAt),
  };
  console.log(`[Jarvis][Timing ${trace.traceId}] ${stage}`, payload);
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
  trace?: KokoroTimingTrace,
): Promise<boolean> {
  const requestStartedAt = getTimingNow();
  logKokoroTiming(trace, 'tts:request:start', {
    voice: voice || 'af_bella',
    textLength: text.length,
  });

  try {
    const controller = new AbortController();
    if (token) token.controller = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(KOKORO_LOCAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'kokoro',
        input: text.trim(),
        voice: voice || 'af_bella',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    logKokoroTiming(trace, 'tts:response:headers', {
      status: response.status,
      requestMs: Math.round(getTimingNow() - requestStartedAt),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      logKokoroTiming(trace, 'tts:response:error', {
        status: response.status,
        requestMs: Math.round(getTimingNow() - requestStartedAt),
        errorText,
      });
      console.warn('[Jarvis] Kokoro TTS error:', response.status, errorText);
      return false;
    }

    if (token?.cancelled) {
      logKokoroTiming(trace, 'tts:cancelled-before-blob');
      return false;
    }

    const audioBlob = await response.blob();
    logKokoroTiming(trace, 'tts:response:blob', {
      requestMs: Math.round(getTimingNow() - requestStartedAt),
      blobBytes: audioBlob.size,
    });

    const audioUrl = URL.createObjectURL(audioBlob);

    if (token?.cancelled) {
      URL.revokeObjectURL(audioUrl);
      logKokoroTiming(trace, 'tts:cancelled-before-play');
      return false;
    }

    return await new Promise<boolean>((resolve) => {
      const audio = new Audio();
      currentAudio = audio;

      if (outputDeviceId && 'setSinkId' in audio) {
        (audio as any).setSinkId(outputDeviceId).catch(() => {});
      }

      audio.onplaying = () => {
        logKokoroTiming(trace, 'tts:audio:playing', {
          requestMs: Math.round(getTimingNow() - requestStartedAt),
        });
      };
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        logKokoroTiming(trace, 'tts:audio:ended', {
          requestMs: Math.round(getTimingNow() - requestStartedAt),
        });
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        logKokoroTiming(trace, 'tts:audio:error', {
          requestMs: Math.round(getTimingNow() - requestStartedAt),
        });
        resolve(false);
      };

      audio.src = audioUrl;
      audio.play()
        .then(() => {
          logKokoroTiming(trace, 'tts:audio:play-resolved', {
            requestMs: Math.round(getTimingNow() - requestStartedAt),
          });
        })
        .catch(() => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          logKokoroTiming(trace, 'tts:audio:play-rejected', {
            requestMs: Math.round(getTimingNow() - requestStartedAt),
          });
          resolve(false);
        });
    });
  } catch (err) {
    if (token?.cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
      logKokoroTiming(trace, 'tts:aborted', {
        requestMs: Math.round(getTimingNow() - requestStartedAt),
      });
      return false;
    }
    logKokoroTiming(trace, 'tts:exception', {
      requestMs: Math.round(getTimingNow() - requestStartedAt),
      error: err instanceof Error ? err.message : String(err),
    });
    console.warn('[Jarvis] Kokoro TTS failed:', err);
    return false;
  } finally {
    if (token) token.controller = null;
  }
}
