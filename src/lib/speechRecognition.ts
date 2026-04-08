import { startUtteranceCapture } from '@/lib/captureUtterance';

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

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

async function getSupabaseClient() {
  const { supabase } = await import('@/integrations/supabase/client');
  return supabase;
}

async function transcribeWithElevenLabs(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'utterance.webm');
  formData.append('language', 'eng');

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('elevenlabs-transcribe', {
    body: formData,
  });

  if (error) {
    const status = (error as any)?.context?.status;
    throw new SpeechRecognitionUnavailableError(
      `Remote speech recognition failed${status ? ` (${status})` : ''}.`
    );
  }

  return typeof data?.text === 'string' ? data.text.trim() : '';
}

function createBrowserSpeechRecognitionController(): SpeechRecognitionController {
  let recognition: any;

  const promise = new Promise<string>((resolve, reject) => {
    if (!SpeechRecognitionCtor) {
      reject(new BrowserSpeechRecognitionError('unsupported', 'Browser Speech Recognition not supported'));
      return;
    }

    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = true;

    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        try { recognition.stop(); } catch {}
      }
    }, 5000);

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
      const latestResult = event.results?.[event.resultIndex];
      const transcript = latestResult?.[0]?.transcript?.trim() || '';
      if (!transcript) return;

      if (latestResult.isFinal || transcript.length > 4) {
        try { recognition.stop(); } catch {}
        finish(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      const code = event.error || 'unknown';
      if (code === 'no-speech' || code === 'aborted') {
        finish('');
        return;
      }

      fail(new BrowserSpeechRecognitionError(code, `Speech recognition error: ${code}`));
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

function createElevenLabsSpeechRecognitionController(deviceId?: string): SpeechRecognitionController {
  let stopCapture = () => undefined;
  let stopped = false;

  const promise = (async () => {
    const capture = await startUtteranceCapture({
      deviceId,
      maxDurationMs: 8000,
      silenceDurationMs: 450,
      levelThreshold: 3,
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
      return await transcribeWithElevenLabs(audioBlob);
    } catch (error) {
      throw new SpeechRecognitionUnavailableError(
        error instanceof Error ? error.message : 'Remote speech recognition failed.'
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
  _options: SpeechRecognitionStartOptions = {}
): SpeechRecognitionController {
  let activeController: SpeechRecognitionController | null = null;
  let stopped = false;

  // Always use free browser Speech Recognition as primary
  const attempts = SpeechRecognitionCtor
    ? [{ label: 'browser speech recognition', create: () => createBrowserSpeechRecognitionController() }]
    : [{ label: 'remote speech recognition', create: () => createElevenLabsSpeechRecognitionController(deviceId) }];

  const promise = (async () => {
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
