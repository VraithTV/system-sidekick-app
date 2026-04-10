/**
 * Clap Detector
 * Listens for a double-clap pattern via the microphone to trigger an action.
 * Uses AudioContext + AnalyserNode to detect sharp transient peaks.
 */

type ClapDetectorOptions = {
  /** Minimum amplitude level (0-128) to count as a clap. Default: 40 */
  threshold?: number;
  /** Max time between two claps to count as a double-clap (ms). Default: 600 */
  maxGapMs?: number;
  /** Min time between two claps to avoid double-counting one clap (ms). Default: 100 */
  minGapMs?: number;
  /** Callback when a double-clap is detected */
  onDoubleClap: () => void;
};

export type ClapDetectorController = {
  stop: () => void;
};

/**
 * Start listening for double-clap patterns on the default mic.
 * Returns a controller with a stop() method.
 *
 * NOTE: Must be called from a user gesture context on mobile browsers
 * so getUserMedia is allowed.
 */
export async function startClapDetector(
  options: ClapDetectorOptions
): Promise<ClapDetectorController> {
  const threshold = options.threshold ?? 40;
  const maxGapMs = options.maxGapMs ?? 600;
  const minGapMs = options.minGapMs ?? 100;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  let lastClapTime = 0;
  let inClap = false;
  let stopped = false;
  let rafId = 0;

  const tick = () => {
    if (stopped) return;

    analyser.getByteTimeDomainData(data);

    // Measure peak deviation from silence (128)
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const val = Math.abs(data[i] - 128);
      if (val > peak) peak = val;
    }

    const now = performance.now();

    if (peak >= threshold) {
      if (!inClap) {
        inClap = true;
        const gap = now - lastClapTime;

        if (lastClapTime > 0 && gap >= minGapMs && gap <= maxGapMs) {
          // Double clap detected
          lastClapTime = 0;
          try {
            options.onDoubleClap();
          } catch (e) {
            console.warn('[ClapDetector] onDoubleClap error:', e);
          }
        } else {
          lastClapTime = now;
        }
      }
    } else {
      inClap = false;
    }

    // Reset if too long since last clap
    if (lastClapTime > 0 && now - lastClapTime > maxGapMs * 2) {
      lastClapTime = 0;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  const stop = () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    source.disconnect();
    analyser.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  };

  return { stop };
}
