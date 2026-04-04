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
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,hsl(222,28%,5%)_100%)]" />

        <div className="relative flex flex-col items-center">
          <AssistantOrb />

          <button
            onClick={toggleMic}
            className={`mt-10 flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs tracking-wide transition-all duration-300 ${
              micOn
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.1)]'
                : 'bg-[hsl(222,20%,9%)] text-muted-foreground border border-[hsl(222,15%,14%)] hover:text-foreground hover:border-[hsl(222,15%,18%)]'
            }`}
          >
            {micOn ? (
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <MicOff className="w-3.5 h-3.5" />
            )}
            {micOn ? `Listening for "${settings.wakeName}"` : 'Enable Microphone'}
          </button>

          <p className="mt-3 text-muted-foreground/30 font-mono text-[10px] tracking-wide">
            {micOn
              ? `Say "${settings.wakeName}" followed by a command`
              : 'Open in a new tab for voice features'}
          </p>
        </div>

        {/* Command log - bottom */}
        {commands.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <CommandHistory />
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-52 border-l border-[hsl(222,15%,10%)] bg-[hsl(222,26%,5%)] p-3 flex flex-col">
        <StatusPanel />
      </div>
    </div>
  );
};
