function getSpeechRecognitionCtor(): any {
  if (typeof window === 'undefined') return undefined;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}

function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'unknown';
}

type SpeechRecognitionController = {
  promise: Promise<string>;
  stop: () => void;
};

class SpeechRecognitionUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpeechRecognitionUnavailableError';
  }
}

function createBrowserSpeechRecognitionController(): SpeechRecognitionController {
  let recognition: any;

  const promise = new Promise<string>((resolve, reject) => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      const browser = getBrowserName();
      if (browser === 'Firefox') {
        reject(new SpeechRecognitionUnavailableError(
          'Firefox does not support speech recognition yet. Use Chrome or Edge, or install the "Speech Recognition Polyfill" Firefox addon.'
        ));
      } else {
        reject(new SpeechRecognitionUnavailableError(
          `Speech recognition is not available in ${browser}. Try Chrome or Edge.`
        ));
      }
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
      if (code === 'no-speech' || code === 'aborted' || code === 'network') {
        finish('');
        return;
      }

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        fail(new SpeechRecognitionUnavailableError(
          'Microphone access was denied. Allow microphone permission in your browser settings and try again.'
        ));
        return;
      }

      // Treat unknown errors as non-fatal so the loop can retry
      console.warn('[Jarvis] Speech recognition error:', code);
      finish('');
    };

    recognition.onend = () => {
      finish('');
    };

    try {
      recognition.start();
    } catch (error) {
      clearTimeout(timeout);
      fail(
        new SpeechRecognitionUnavailableError(
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

export function startSpeechRecognition(
  _deviceId?: string,
): SpeechRecognitionController {
  let activeController: SpeechRecognitionController | null = null;
  let stopped = false;

  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  if (!SpeechRecognitionCtor) {
    const browser = getBrowserName();
    if (browser === 'Firefox') {
      throw new SpeechRecognitionUnavailableError(
        'Firefox does not support speech recognition yet. Use Chrome or Edge, or install the "Speech Recognition Polyfill" Firefox addon.'
      );
    }
    throw new SpeechRecognitionUnavailableError(
      `Speech recognition is not available in ${browser}. Try using Chrome or Edge.`
    );
  }
  const attempts = [{ label: 'browser speech recognition', create: () => createBrowserSpeechRecognitionController() }];

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
