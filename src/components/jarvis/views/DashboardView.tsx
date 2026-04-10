import { useState, useEffect } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { ChatInput } from '../ChatInput';
import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { requestVoiceAssistantStart, requestVoiceAssistantStop } from '@/hooks/useVoiceAssistant';
import { createT } from '@/lib/i18n';

export const DashboardView = () => {
  const { commands, settings, systemStatus, state } = useJarvisStore();
  const micOn = systemStatus.micActive;
  const [time, setTime] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(false);
  const t = createT(settings.language || 'en');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMic = () => {
    if (micOn) {
      requestVoiceAssistantStop();
    } else {
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
            {chatOpen ? (
              <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl h-72 flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
                  <span className="font-display text-[9px] tracking-[0.2em] text-primary/60 uppercase">Chat</span>
                  <button onClick={() => setChatOpen(false)} className="text-muted-foreground/40 hover:text-foreground/60 text-xs">✕</button>
                </div>
                <ChatInput />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-mono tracking-wider text-muted-foreground/60 border border-border/20 hover:border-primary/30 hover:text-primary/60 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  Type to chat
                </button>
                {commands.length > 0 && <div className="flex-1 min-w-0"><CommandHistory /></div>}
              </div>
            )}
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
