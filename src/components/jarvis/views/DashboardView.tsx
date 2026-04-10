import { useState, useEffect, useRef } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff } from 'lucide-react';
import { requestVoiceAssistantStart, requestVoiceAssistantStop } from '@/hooks/useVoiceAssistant';
import { primeMicStream } from '@/lib/speechRecognition';
import { createT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import { startClapDetector, type ClapDetectorController } from '@/lib/clapDetector';

export const DashboardView = () => {
  const { settings, systemStatus, state, setSystemStatus } = useJarvisStore();
  const micOn = systemStatus.micActive;
  const [time, setTime] = useState(new Date());
  const [clapActive, setClapActive] = useState(false);
  const clapRef = useRef<ClapDetectorController | null>(null);
  const t = createT(settings.language || 'en');
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Clean up clap detector when mic becomes active (clap detector handed off)
  // or on unmount
  useEffect(() => {
    if (micOn && clapRef.current) {
      clapRef.current.stop();
      clapRef.current = null;
      setClapActive(false);
    }
    return () => {
      clapRef.current?.stop();
      clapRef.current = null;
    };
  }, [micOn]);

  const toggleClapDetection = async () => {
    // Toggle off if already running
    if (clapRef.current) {
      clapRef.current.stop();
      clapRef.current = null;
      setClapActive(false);
      return;
    }
    try {
      const controller = await startClapDetector({
        onDoubleClap: async () => {
          console.log('[Jarvis] Double clap detected! Enabling mic...');
          controller.stop();
          clapRef.current = null;
          setClapActive(false);
          // Prime the mic stream and start listening
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            primeMicStream(stream);
          } catch { /* mic permission already granted via clap detector */ }
          setSystemStatus({ micActive: true });
          requestVoiceAssistantStart();
        },
      });
      clapRef.current = controller;
      setClapActive(true);
    } catch (err) {
      console.warn('[Jarvis] Clap detector failed to start:', err);
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      requestVoiceAssistantStop();
    } else {
      // Stop clap detector first so it releases the mic stream
      if (clapRef.current) {
        clapRef.current.stop();
        clapRef.current = null;
        setClapActive(false);
      }
      // Prime mic permission directly from user gesture (required by mobile browsers)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        primeMicStream(stream);
      } catch (err) {
        console.warn('[Jarvis] Mic permission denied:', err);
        return;
      }
      setSystemStatus({ micActive: true });
      requestVoiceAssistantStart();
    }
  };

  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const wake = settings.wakeName;

  const statusLabel = micOn
    ? state === 'listening' ? t('dash.listening') : state === 'thinking' ? t('dash.processing') : state === 'speaking' ? t('dash.speaking') : t('dash.standby')
    : t('dash.enableMic');

  const hintLabel = micOn
    ? state === 'standby'
      ? t('dash.sayToActivate', { wake })
      : state === 'listening'
        ? t('dash.listeningForCommand')
        : state === 'thinking'
          ? t('dash.thinking')
          : state === 'speaking'
            ? t('dash.responding')
            : t('dash.sayToActivate', { wake })
    : t('dash.tapToStart', { wake });

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {/* Clock at top */}
        <div className="text-center pt-6 pb-4">
          <p className="font-display text-3xl tracking-[0.08em] text-primary glow-text">{timeStr}</p>
          <p className="font-mono text-[10px] text-muted-foreground/40 mt-1.5 tracking-[0.25em] uppercase">{dateStr}</p>
        </div>

        {/* Orb centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06)_0%,transparent_50%)] scale-[2]" />
            <AssistantOrb />
          </div>

          <button
            onClick={toggleMic}
            className={`mt-8 flex items-center gap-3 rounded-full px-7 py-3 font-display text-xs tracking-[0.18em] uppercase transition-all duration-300 ${
              micOn
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_28px_hsl(var(--primary)/0.15)]'
                : 'text-primary border border-primary/25 hover:bg-primary/8 hover:border-primary/40'
            }`}
          >
            {micOn ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            {statusLabel}
          </button>

          <p className="mt-4 text-center text-sm text-foreground/50">{hintLabel}</p>
          <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground/40 px-4">
            {micOn
              ? `Try: "Hey ${wake}, what time is it?"`
              : `Try: "${wake}, open Chrome"`}
          </p>

          {!micOn && (
            <button
              onClick={toggleClapDetection}
              className={`mt-4 flex items-center gap-2 rounded-full px-5 py-2 font-display text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
                clapActive
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground border border-border/40 hover:text-primary hover:border-primary/30'
              }`}
            >
              <span className="text-sm">👏</span>
              {clapActive ? 'Clap detection active' : 'Enable clap to activate'}
            </button>
          )}
        </div>

        {/* Session info at bottom */}
        <div className="px-6 pb-6 pt-2">
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="font-display text-[9px] tracking-[0.25em] text-primary/60 uppercase mb-2">{t('dash.session')}</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-success shadow-[0_0_6px_hsl(var(--success)/0.5)]' : 'bg-muted-foreground/30'}`} />
                <span className="font-mono text-[10px] text-muted-foreground">{micOn ? t('dash.active') : t('dash.idle')}</span>
              </div>
              <span className="font-mono text-[10px] text-primary/70">{t('status.online')}</span>
              <span className="font-mono text-[10px] text-muted-foreground">~120ms</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />

        <div className="relative flex flex-col items-center">
          <AssistantOrb />

          <button
            onClick={toggleMic}
            className={`mt-10 flex items-center gap-3 rounded-full px-8 py-3.5 font-display text-xs tracking-[0.18em] uppercase transition-all duration-300 ${
              micOn
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_28px_hsl(var(--primary)/0.15)]'
                : 'text-primary border border-primary/25 hover:bg-primary/8 hover:border-primary/40'
            }`}
          >
            {micOn ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            {statusLabel}
          </button>

          <p className="mt-5 text-center text-sm text-foreground/50">
            {hintLabel}
          </p>
          <p className="mt-1.5 text-center font-mono text-[11px] text-muted-foreground/40">
            {micOn
              ? `Try: "Hey ${wake}, what time is it?"`
              : `Try: "${wake}, open Chrome" · "${wake}, what's the weather?"`}
          </p>

          <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground/30 max-w-xs leading-relaxed">
            Voice responses may take a few seconds. Improvements coming soon.
          </p>
          {!micOn && (
            <button
              onClick={toggleClapDetection}
              className={`mt-5 flex items-center gap-2 rounded-full px-6 py-2.5 font-display text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
                clapActive
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground border border-border/40 hover:text-primary hover:border-primary/30'
              }`}
            >
              <span className="text-sm">👏</span>
              {clapActive ? 'Clap detection active' : 'Enable clap to activate'}
            </button>
          )}
        </div>

      </div>

      <div className="w-52 border-l border-border/40 bg-card/20 backdrop-blur-sm p-5 flex flex-col overflow-y-auto">
        {/* Clock */}
        <div className="text-center pt-2 pb-6">
          <p className="font-display text-3xl tracking-[0.08em] text-primary glow-text">{timeStr}</p>
          <p className="font-mono text-[10px] text-muted-foreground/40 mt-2 tracking-[0.25em] uppercase">{dateStr}</p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* Session info */}
        <div className="py-5 space-y-2.5">
          <p className="font-display text-[9px] tracking-[0.25em] text-primary/60 uppercase">{t('dash.session')}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground/60">{t('dash.status')}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-success shadow-[0_0_6px_hsl(var(--success)/0.5)]' : 'bg-muted-foreground/30'}`} />
                <span className="font-mono text-[10px] text-muted-foreground">{micOn ? t('dash.active') : t('dash.idle')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground/60">{t('dash.engine')}</span>
              <span className="font-mono text-[10px] text-primary/70">{t('status.online')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground/60">{t('dash.latency')}</span>
              <span className="font-mono text-[10px] text-muted-foreground">~120ms</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-4" />
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[8px] text-primary/60 tracking-[0.2em] uppercase">Beta v1.2.7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
