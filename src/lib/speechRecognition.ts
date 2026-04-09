const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

function getSpeechRecognitionCtor(): any {
  if (typeof window === 'undefined') return undefined;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}

function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Electron')) return 'Electron';
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

// ─── ElevenLabs STT credit tracking ─────────────────────────

/** Once STT credits are exhausted, skip ElevenLabs STT for this session */
let sttCreditsExhausted = false;

export function isElevenLabsSTTExhausted(): boolean {
  return sttCreditsExhausted;
}

// ─── Persistent mic stream (avoids flickering) ───────────────

let cachedMicStream: MediaStream | null = null;

async function getMicStream(deviceId?: string): Promise<MediaStream> {
  if (cachedMicStream && cachedMicStream.getAudioTracks().every(t => t.readyState === 'live')) {
    return cachedMicStream;
  }

  const constraints: MediaStreamConstraints = {
    audio: deviceId
      ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  };

  cachedMicStream = await navigator.mediaDevices.getUserMedia(constraints);
  return cachedMicStream;
}

// ─── MediaRecorder + ElevenLabs STT ──────────────────────────

function createMediaRecorderSTTController(deviceId?: string, langCode?: string): SpeechRecognitionController {
  let stopped = false;
  let recorder: MediaRecorder | null = null;
  let audioContext: AudioContext | null = null;
  let rafId = 0;

  const promise = new Promise<string>(async (resolve, reject) => {
    try {
      const stream = await getMicStream(deviceId);
      if (stopped) { resolve(''); return; }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : undefined;

      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];

      // Voice activity detection
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      let heardSpeech = false;
      let silenceStart = 0;
      const SILENCE_MS = 1500;
      const MAX_DURATION_MS = 12000;
      const LEVEL_THRESHOLD = 3;
      const startTime = performance.now();

      const measure = () => {
        analyser!.getByteTimeDomainData(samples);
        let total = 0;
        for (let i = 0; i < samples.length; i++) total += Math.abs(samples[i] - 128);
        return total / samples.length;
      };

      const tick = () => {
        if (stopped || !recorder || recorder.state !== 'recording') return;
        const now = performance.now();
        const level = measure();

        if (level > LEVEL_THRESHOLD) {
          heardSpeech = true;
          silenceStart = 0;
        } else if (heardSpeech) {
          if (!silenceStart) silenceStart = now;
          if (now - silenceStart >= SILENCE_MS) {
            recorder.stop();
            return;
          }
        }

        if (now - startTime >= MAX_DURATION_MS) {
          recorder.stop();
          return;
        }

        rafId = requestAnimationFrame(tick);
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        cancelAnimationFrame(rafId);
        if (audioContext && audioContext.state !== 'closed') {
          try { await audioContext.close(); } catch {}
        }

        if (stopped || chunks.length === 0) {
          resolve('');
          return;
        }

        const blob = new Blob(chunks, { type: recorder!.mimeType || 'audio/webm' });

        if (blob.size < 800) {
          resolve('');
          return;
        }

        try {
          const transcript = await transcribeWithElevenLabs(blob, langCode);
          resolve(transcript);
        } catch (err) {
          console.warn('[Jarvis] ElevenLabs STT failed:', err);
          // Mark credits as exhausted if it looks like a quota error
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('quota') || errMsg.includes('401') || errMsg.includes('429')) {
            sttCreditsExhausted = true;
            console.warn('[Jarvis] ElevenLabs STT credits exhausted. Will use browser speech recognition from now on.');
          }
          // Reject so the outer fallback logic can try browser STT
          reject(new Error('ElevenLabs STT failed: ' + errMsg));
        }
      };

      recorder.onerror = () => {
        cancelAnimationFrame(rafId);
        resolve('');
      };

      recorder.start(250);
      rafId = requestAnimationFrame(tick);

    } catch (err) {
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'NotFoundError' || err.name === 'NotReadableError')) {
        reject(new SpeechRecognitionUnavailableError(
          err.name === 'NotAllowedError'
            ? 'Microphone access was denied. Allow microphone permission and try again.'
            : err.name === 'NotFoundError'
              ? 'No microphone found. Connect a microphone and try again.'
              : 'Microphone is in use by another app.'
        ));
      } else {
        reject(err);
      }
    }
  });

  return {
    promise,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      try { recorder?.stop(); } catch {}
    },
  };
}

async function transcribeWithElevenLabs(audioBlob: Blob, langCode?: string): Promise<string> {
  const { supabase } = await import('@/integrations/supabase/client');

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const langMap: Record<string, string> = {
    'en-US': 'eng', 'en-GB': 'eng', 'fr-FR': 'fra', 'de-DE': 'deu',
    'es-ES': 'spa', 'pt-BR': 'por', 'ru-RU': 'rus', 'ja-JP': 'jpn',
    'ko-KR': 'kor', 'zh-CN': 'cmn', 'ar-SA': 'ara', 'hi-IN': 'hin',
    'it-IT': 'ita',
  };
  const elevenLabsLang = langMap[langCode || 'en-US'] || '';
  if (elevenLabsLang) {
    formData.append('language', elevenLabsLang);
  }

  const { data, error } = await supabase.functions.invoke('elevenlabs-transcribe', {
    body: formData,
  });

  if (error) throw error;
  return (data?.text || '').trim();
}

// ─── Browser Web Speech API (Chrome/Edge/Electron) ─────────

function createBrowserSpeechRecognitionController(langCode?: string): SpeechRecognitionController {
  let recognition: any;

  const promise = new Promise<string>((resolve, reject) => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      const browser = getBrowserName();
      if (browser === 'Firefox') {
        reject(new SpeechRecognitionUnavailableError(
          'Firefox does not support speech recognition yet. Use Chrome or Edge.'
        ));
      } else {
        reject(new SpeechRecognitionUnavailableError(
          `Speech recognition is not available in ${browser}. Try Chrome or Edge.`
        ));
      }
      return;
    }

    recognition = new SpeechRecognitionCtor();
    recognition.lang = langCode || 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = true;

    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        try { recognition.stop(); } catch {}
      }
    }, 8000);

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
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0]?.transcript || '';
        }
      }

      if (finalTranscript.trim()) {
        try { recognition.stop(); } catch {}
        finish(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      const code = event.error || 'unknown';
      if (code === 'no-speech' || code === 'aborted') {
        finish('');
        return;
      }

      if (code === 'network') {
        fail(new SpeechRecognitionUnavailableError(
          'Speech recognition network service is unavailable. Using cloud transcription instead.'
        ));
        return;
      }

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        fail(new SpeechRecognitionUnavailableError(
          'Microphone access was denied. Allow microphone permission in your browser settings and try again.'
        ));
        return;
      }

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

// ─── Public API ─────────────────────────────────────────────

export function startSpeechRecognition(
  _deviceId?: string,
  langCode?: string,
): SpeechRecognitionController {
  let activeController: SpeechRecognitionController | null = null;
  let stopped = false;

  const SpeechRecognitionCtor = getSpeechRecognitionCtor();

  const attempts: { label: string; create: () => SpeechRecognitionController }[] = [];

  if (isElectron && !sttCreditsExhausted) {
    // In Electron, try ElevenLabs STT first (better quality)
    attempts.push({
      label: 'cloud transcription (ElevenLabs)',
      create: () => createMediaRecorderSTTController(_deviceId, langCode),
    });
  }

  // Browser Web Speech API as primary (browser) or fallback (Electron)
  if (SpeechRecognitionCtor) {
    attempts.push({
      label: 'browser speech recognition',
      create: () => createBrowserSpeechRecognitionController(langCode),
    });
  }

  // If not in Electron and browser STT is available, also offer ElevenLabs as fallback
  if (!isElectron && !sttCreditsExhausted) {
    attempts.push({
      label: 'cloud transcription (ElevenLabs)',
      create: () => createMediaRecorderSTTController(_deviceId, langCode),
    });
  }

  if (attempts.length === 0) {
    const browser = getBrowserName();
    throw new SpeechRecognitionUnavailableError(
      `Speech recognition is not available in ${browser}. Try using Chrome or Edge.`
    );
  }

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
