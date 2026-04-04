import { useState } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { StatusPanel } from '../StatusPanel';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff } from 'lucide-react';

export const DashboardView = () => {
  const { commands, settings, setSystemStatus } = useJarvisStore();
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Center - orb area */}
      <div className="flex-1 flex flex-col items-center justify-center relative grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,hsl(var(--background))_100%)]" />

        <div className="relative flex flex-col items-center">
          <AssistantOrb />

          <button
            onClick={toggleMic}
            className={`mt-10 flex items-center gap-2.5 px-6 py-3 rounded-full font-mono text-xs tracking-wide transition-all duration-300 ${
              micOn
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12)]'
                : 'bg-secondary text-muted-foreground border border-border hover:text-foreground hover:border-muted-foreground/20'
            }`}
          >
            {micOn ? (
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <MicOff className="w-3.5 h-3.5" />
            )}
            {micOn ? `Listening for "${settings.wakeName}"` : 'Enable Microphone'}
          </button>

          <p className="mt-3 text-muted-foreground/60 font-mono text-[10px] tracking-wide">
            {micOn
              ? `Say "${settings.wakeName}" followed by a command`
              : 'Click to activate voice control'}
          </p>
        </div>

        {/* Command log overlay */}
        {commands.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <CommandHistory />
          </div>
        )}
      </div>

      {/* Right status panel */}
      <div className="w-56 border-l border-border bg-card p-4 flex flex-col">
        <StatusPanel />
      </div>
    </div>
  );
};
