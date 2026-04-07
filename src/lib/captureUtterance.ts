type CaptureUtteranceOptions = {
  deviceId?: string;
  maxDurationMs?: number;
  silenceDurationMs?: number;
  levelThreshold?: number;
};

export type CaptureUtteranceController = {
  promise: Promise<Blob | null>;
  stop: () => void;
};

export async function startUtteranceCapture(
  options: CaptureUtteranceOptions = {}
): Promise<CaptureUtteranceController> {
  const audioConstraints = options.deviceId
    ? {
        deviceId: { exact: options.deviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    : {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];
  let rafId = 0;
  let resolved = false;
  let resolvePromise: (blob: Blob | null) => void = () => undefined;

  const promise = new Promise<Blob | null>((resolve) => {
    resolvePromise = resolve;
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);

  const cleanup = async () => {
    if (rafId) cancelAnimationFrame(rafId);
    source.disconnect();
    analyser.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  };

  const finish = async (blob: Blob | null) => {
    if (resolved) return;
    resolved = true;
    await cleanup();
    resolvePromise(blob);
  };

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = async () => {
    const blob = chunks.length
      ? new Blob(chunks, { type: recorder.mimeType || mimeType })
      : null;
    await finish(blob);
  };

  recorder.onerror = async () => {
    await finish(null);
  };

  recorder.start(100);

  const startedAt = performance.now();
  const maxDurationMs = options.maxDurationMs ?? 8000;
  const silenceDurationMs = options.silenceDurationMs ?? 700;
  const levelThreshold = options.levelThreshold ?? 8;
  let heardSpeech = false;
  let silenceStartedAt = 0;

  const measure = () => {
    analyser.getByteTimeDomainData(samples);
    let total = 0;
    for (let i = 0; i < samples.length; i += 1) {
      total += Math.abs(samples[i] - 128);
    }
    return total / samples.length;
  };

  const tick = () => {
    const now = performance.now();
    const level = measure();

    if (level > levelThreshold) {
      heardSpeech = true;
      silenceStartedAt = 0;
    } else if (heardSpeech) {
      if (!silenceStartedAt) silenceStartedAt = now;
      if (now - silenceStartedAt >= silenceDurationMs && recorder.state === 'recording') {
        recorder.stop();
        return;
      }
    }

    if (now - startedAt >= maxDurationMs && recorder.state === 'recording') {
      recorder.stop();
      return;
    }

    if (!resolved && recorder.state === 'recording') {
      rafId = requestAnimationFrame(tick);
    }
  };

  rafId = requestAnimationFrame(tick);

  return {
    promise,
    stop: () => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    },
  };
}