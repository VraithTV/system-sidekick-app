import { useState, useEffect } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff, Zap } from 'lucide-react';
import { requestVoiceAssistantStart, requestVoiceAssistantStop } from '@/hooks/useVoiceAssistant';
import { getRemainingUses, getDailyLimit } from '@/lib/usageLimit';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const DashboardView = () => {
  const { commands, settings, systemStatus, state, setSystemStatus } = useJarvisStore();
  const micOn = systemStatus.micActive;
  const limit = getDailyLimit();
  const [remaining, setRemaining] = useState(getRemainingUses());
  const [time, setTime] = useState(new Date());
  const t = createT(settings.language || 'en');

  useEffect(() => {
    setRemaining(getRemainingUses());
  }, [commands.length]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMic = () => {
    if (!isElectron) {
      if (micOn) {
        requestVoiceAssistantStop();
      } else {
        requestVoiceAssistantStart();
      }
      return;
    }

    setSystemStatus({ micActive: !micOn });
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
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-3">
          <div className="flex-1 min-w-0">
            {commands.length > 0 && <CommandHistory />}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm px-3.5 py-1.5">
              <Zap className={`h-3.5 w-3.5 ${remaining === 0 ? 'text-destructive' : 'text-primary'}`} />
              <span className={`font-mono text-[11px] ${remaining === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remaining}/{limit}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-52 border-l border-border/40 bg-card/20 backdrop-blur-sm p-5 flex flex-col overflow-y-auto">
        {/* Clock */}
        <div className="text-center pt-2 pb-6">
          <p className="font-display text-3xl tracking-[0.08em] text-primary glow-text">{timeStr}</p>
          <p className="font-mono text-[10px] text-muted-foreground/40 mt-2 tracking-[0.25em] uppercase">{dateStr}</p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* Quick stats */}
        <div className="py-5 space-y-3">
          <p className="font-display text-[9px] tracking-[0.25em] text-primary/60 uppercase">{t('dash.quickStats')}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/40 bg-background/40 p-3 text-center">
              <p className="font-display text-lg text-primary glow-text">{commands.length}</p>
              <p className="font-mono text-[8px] text-muted-foreground/50 mt-0.5 tracking-wider uppercase">{t('dash.commands')}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-3 text-center">
              <p className="font-display text-lg text-primary glow-text">{remaining}</p>
              <p className="font-mono text-[8px] text-muted-foreground/50 mt-0.5 tracking-wider uppercase">{t('dash.remaining')}</p>
            </div>
          </div>
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
              <span className="font-mono text-[8px] text-primary/60 tracking-[0.2em] uppercase">Beta v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
