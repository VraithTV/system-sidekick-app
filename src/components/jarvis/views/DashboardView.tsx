import { useState } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff } from 'lucide-react';

export const DashboardView = () => {
  const { commands, settings, setSystemStatus, state } = useJarvisStore();
  const { startListening, stopListening } = useVoiceAssistant();
  const [micOn, setMicOn] = useState(false);

  const toggleMic = () => {
    if (micOn) {
      stopListening();
      setMicOn(false);
      setSystemStatus({ micActive: false });
    } else {
      startListening();
      setMicOn(true);
      setSystemStatus({ micActive: true });
    }
  };

  const stateLabel = (() => {
    if (!micOn) return null;
    switch (state) {
      case 'thinking': return '🧠 Processing…';
      case 'speaking': return '🔊 Speaking…';
      case 'listening': return 'Waiting for wake word…';
      default: return 'Waiting for wake word…';
    }
  })();

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative bg-background overflow-hidden">
      {/* Subtle radial glow behind orb */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />

      <div className="relative flex flex-col items-center">
        <AssistantOrb />

        {/* Mic button */}
        <button
          onClick={toggleMic}
          className={`mt-10 flex items-center gap-3 rounded-full px-8 py-3.5 font-display text-xs tracking-[0.18em] uppercase transition-all duration-300 ${
            micOn
              ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_28px_hsl(var(--primary)/0.15)]'
              : 'text-primary border border-primary/25 hover:bg-primary/8 hover:border-primary/40'
          }`}
        >
          {micOn ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
          {micOn ? 'Listening…' : 'Enable Microphone'}
        </button>

        {/* Status indicator */}
        {micOn && stateLabel && (
          <p className="mt-4 text-center text-sm text-primary/80 font-mono animate-pulse">
            {stateLabel}
          </p>
        )}

        {/* Helper text */}
        <p className="mt-3 text-center text-sm text-foreground/50">
          {micOn
            ? `Say "${settings.wakeName}" followed by a command`
            : 'Tap the button above to start talking to ' + settings.wakeName}
        </p>
        <p className="mt-1.5 text-center font-mono text-[11px] text-muted-foreground/40">
          {micOn
            ? `Try: "Hey ${settings.wakeName}, what time is it?"`
            : `Try: "${settings.wakeName}, open Chrome" · "${settings.wakeName}, what's the weather?"`}
        </p>

      </div>

      {/* Command log */}
      {commands.length > 0 && (
        <div className="absolute bottom-5 left-5 right-5">
          <CommandHistory />
        </div>
      )}
    </div>
  );
};
