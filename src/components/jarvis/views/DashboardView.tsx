import { useState, useEffect } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff, Zap } from 'lucide-react';
import { getRemainingUses } from '@/lib/usageLimit';
import { getModeById } from '@/lib/modes';

export const DashboardView = () => {
  const { commands, settings, systemStatus, state, mode } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const micOn = systemStatus.micActive;
  const limit = settings.dailyLimit;
  const [remaining, setRemaining] = useState(getRemainingUses(limit));
  const modeInfo = getModeById(mode);

  useEffect(() => {
    setRemaining(getRemainingUses(limit));
  }, [commands.length, limit]);

  const toggleMic = () => {
    if (micOn) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />

      <div className="relative flex flex-col items-center">
        {/* Active mode badge */}
        <div className="mb-4 flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3.5 py-1">
          <span className="text-sm">{modeInfo.icon}</span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{modeInfo.label} Mode</span>
        </div>

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

        <div className="mt-4 flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5">
          <Zap className={`h-3.5 w-3.5 ${remaining === 0 ? 'text-destructive' : 'text-primary'}`} />
          <span className={`font-mono text-[11px] ${remaining === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {remaining}/{limit} commands today
          </span>
        </div>
      </div>

      {commands.length > 0 && (
        <div className="absolute bottom-5 left-5 right-5">
          <CommandHistory />
        </div>
      )}
    </div>
  );
};
