import { useState, useEffect } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { StatusPanel } from '../StatusPanel';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff, Zap, Clock, Wifi } from 'lucide-react';
import { getRemainingUses, getDailyLimit } from '@/lib/usageLimit';

export const DashboardView = () => {
  const { commands, settings, systemStatus, state } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const micOn = systemStatus.micActive;
  const limit = getDailyLimit();
  const [remaining, setRemaining] = useState(getRemainingUses());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setRemaining(getRemainingUses());
  }, [commands.length]);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMic = () => {
    if (micOn) stopListening();
    else startListening();
  };

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex-1 flex bg-background overflow-hidden">
      {/* Main area with orb */}
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
            {micOn ? (state === 'listening' ? 'Listening…' : state === 'thinking' ? 'Processing…' : state === 'speaking' ? 'Speaking…' : 'Standby') : 'Enable Microphone'}
          </button>

          <p className="mt-5 text-center text-sm text-foreground/50">
            {micOn
              ? state === 'standby'
                ? `Say "${settings.wakeName}" to activate`
                : state === 'listening'
                  ? 'Listening for your command…'
                  : state === 'thinking'
                    ? 'Thinking…'
                    : state === 'speaking'
                      ? 'Responding…'
                      : `Say "${settings.wakeName}" to activate`
              : 'Tap the button above to start talking to ' + settings.wakeName}
          </p>
          <p className="mt-1.5 text-center font-mono text-[11px] text-muted-foreground/40">
            {micOn
              ? `Try: "Hey ${settings.wakeName}, what time is it?"`
              : `Try: "${settings.wakeName}, open Chrome" · "${settings.wakeName}, what's the weather?"`}
          </p>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-3">
          {/* Command log */}
          <div className="flex-1 min-w-0">
            {commands.length > 0 && <CommandHistory />}
          </div>

          {/* Quick stats */}
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

      {/* Right sidebar panel */}
      <div className="w-56 border-l border-border/40 bg-card/30 backdrop-blur-sm p-4 flex flex-col gap-5 overflow-y-auto">
        {/* Clock widget */}
        <div className="text-center py-3">
          <p className="font-display text-2xl tracking-[0.1em] text-primary glow-text">{timeStr}</p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1 tracking-wider uppercase">{dateStr}</p>
        </div>

        <div className="h-px bg-border/40" />

        {/* Connection status */}
        <div className="space-y-2">
          <p className="font-display text-[10px] tracking-[0.2em] text-foreground/50 uppercase">Status</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <Wifi className="h-3.5 w-3.5 text-primary/60" />
            <span>Connected</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary/60" />
            <span>Uptime: Active</span>
          </div>
        </div>

        <div className="h-px bg-border/40" />

        {/* System stats */}
        <StatusPanel />

        <div className="h-px bg-border/40" />

        {/* Beta badge */}
        <div className="mt-auto text-center py-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[9px] text-primary/70 tracking-widest uppercase">Beta v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
