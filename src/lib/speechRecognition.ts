import { startUtteranceCapture } from '@/lib/captureUtterance';

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

const TARGET_SAMPLE_RATE = 16000;
const isElectronApp = typeof window !== 'undefined' && !!(window as any).electronAPI;

type SpeechRecognitionController = {
  promise: Promise<string>;
  stop: () => void;
};

type SpeechRecognitionStartOptions = {
  preferLocal?: boolean;
};

class SpeechRecognitionUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpeechRecognitionUnavailableError';
  }
}

class BrowserSpeechRecognitionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'BrowserSpeechRecognitionError';
    this.code = code;
  }
}

let whisperPipelinePromise: Promise<any> | null = null;

function createBrowserSpeechRecognitionController(): SpeechRecognitionController {
  let recognition: any;

  const promise = new Promise<string>((resolve, reject) => {
    if (!SpeechRecognitionCtor) {
      reject(new BrowserSpeechRecognitionError('unsupported', 'Browser Speech Recognition not supported'));
      return;
    }

    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;  // Get interim results for faster wake word detection
    recognition.maxAlternatives = 3;
    recognition.continuous = true;

    let settled = false;
    let gotResult = false;

    // Auto-stop after 6 seconds if no result
    const timeout = setTimeout(() => {
      if (!settled) {
        try { recognition.stop(); } catch {}
      }
    }, 6000);

    const finish = (value = '') => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(value.trim());
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };

    recognition.onresult = (event: any) => {
      // Check interim results for faster response
      for (let r = 0; r < event.results.length; r++) {
        const result = event.results[r];
        const transcript = result[0]?.transcript || '';

        if (result.isFinal) {
          // Final result: pick best confidence
          gotResult = true;
          let bestTranscript = '';
          let bestConfidence = 0;
          for (let i = 0; i < result.length; i++) {
            if (result[i].confidence > bestConfidence) {
              bestConfidence = result[i].confidence;
              bestTranscript = result[i].transcript;
            }
          }
          if (!bestTranscript) bestTranscript = transcript;
          if (bestTranscript) {
            try { recognition.stop(); } catch {}
            finish(bestTranscript);
            return;
          }
        } else if (transcript.length > 3) {
          // Interim result with enough text: return it immediately
          // This makes wake word detection near-instant
          gotResult = true;
          try { recognition.stop(); } catch {}
          finish(transcript);
          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        finish('');
        return;
      }

      fail(
        new BrowserSpeechRecognitionError(
          event.error || 'unknown',
          `Speech recognition error: ${event.error || 'unknown'}`
        )
      );
    };

    recognition.onend = () => {
      finish('');
    };

    try {
      recognition.start();
    } catch (error) {
      clearTimeout(timeout);
      fail(
        new BrowserSpeechRecognitionError(
          'start-failed',
          error instanceof Error ? error.message : 'Speech recognition failed to start'
        )
      );
    }
  });

  return {
    promise,
    stop: () => {
      try {
        recognition?.abort?.();
      } catch {
        // no-op
      }
    },
  };
}

function mixToMono(audioBuffer: AudioBuffer): Float32Array {
  const mono = new Float32Array(audioBuffer.length);

  for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
    const channel = audioBuffer.getChannelData(channelIndex);
    for (let sampleIndex = 0; sampleIndex < channel.length; sampleIndex += 1) {
      mono[sampleIndex] += channel[sampleIndex] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
}

async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) {
    throw new SpeechRecognitionUnavailableError('AudioContext is not available in this browser.');
  }

  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContextCtor();

  try {
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const mono = mixToMono(decoded);

    if (decoded.sampleRate === TARGET_SAMPLE_RATE) {
      return mono;
    }

    const frameCount = Math.ceil(mono.length * TARGET_SAMPLE_RATE / decoded.sampleRate);
    const offlineContext = new OfflineAudioContext(1, frameCount, TARGET_SAMPLE_RATE);
    const resampleBuffer = offlineContext.createBuffer(1, mono.length, decoded.sampleRate);
    const monoCopy = new Float32Array(mono.length);
    monoCopy.set(mono);
    resampleBuffer.copyToChannel(monoCopy, 0);

    const source = offlineContext.createBufferSource();
    source.buffer = resampleBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const rendered = await offlineContext.startRendering();
    return rendered.getChannelData(0).slice();
  } finally {
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}

async function getWhisperPipeline() {
  if (!whisperPipelinePromise) {
    whisperPipelinePromise = (async () => {
      const transformers = await import('@xenova/transformers');
      const { pipeline, env } = transformers as any;

      env.allowLocalModels = false;
      env.useBrowserCache = true;

      return pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en');
    })();
  }

  return whisperPipelinePromise;
}

async function transcribeLocally(blob: Blob): Promise<string> {
  const audio = await decodeAudioBlob(blob);
  const transcriber = await getWhisperPipeline();
  const result = await transcriber(audio, {
    chunk_length_s: 10,
    stride_length_s: 2,
    return_timestamps: false,
  });

  if (typeof result === 'string') return result.trim();
  if (typeof result?.text === 'string') return result.text.trim();
  return '';
}

function createLocalSpeechRecognitionController(deviceId?: string): SpeechRecognitionController {
  let stopCapture = () => undefined;
  let stopped = false;

  const promise = (async () => {
    const capture = await startUtteranceCapture({
      deviceId,
      maxDurationMs: 15000,
      silenceDurationMs: 1200,
      levelThreshold: 4,
    });

    stopCapture = () => {
      stopped = true;
      capture.stop();
    };

    if (stopped) {
      capture.stop();
      return '';
    }

    const audioBlob = await capture.promise;
    if (stopped || !audioBlob) return '';

    try {
      return await transcribeLocally(audioBlob);
    } catch (error) {
      throw new SpeechRecognitionUnavailableError(
        error instanceof Error ? error.message : 'Local speech recognition failed.'
      );
    }
  })();

  return {
    promise,
    stop: () => stopCapture(),
  };
}

export function startSpeechRecognition(
  deviceId?: string,
  options: SpeechRecognitionStartOptions = {}
): SpeechRecognitionController {
  let activeController: SpeechRecognitionController | null = null;
  let stopped = false;

  const promise = (async () => {
    // Always try browser SpeechRecognition first: it's real-time and responsive.
    // Local Whisper is slow (model load + inference) and only used as fallback.
    const attempts = [
      {
        label: 'browser speech recognition',
        create: () => createBrowserSpeechRecognitionController(),
      },
      {
        label: 'local transcription',
        create: () => createLocalSpeechRecognitionController(deviceId),
      },
    ];

    let lastError: unknown = null;

    for (let index = 0; index < attempts.length; index += 1) {
      const attempt = attempts[index];
      activeController = attempt.create();

      try {
        return await activeController.promise;
      } catch (error) {
        lastError = error;

        if (stopped) return '';

        if (index < attempts.length - 1) {
          console.warn(`[Jarvis] ${attempt.label} failed, trying fallback:`, error);
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new SpeechRecognitionUnavailableError('Speech recognition failed.');
  })();

  return {
    promise,
    stop: () => {
      stopped = true;
      activeController?.stop();
    },
  };
}

export { SpeechRecognitionUnavailableError };