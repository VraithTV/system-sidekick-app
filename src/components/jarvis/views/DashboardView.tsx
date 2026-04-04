import { useState } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { StatusPanel } from '../StatusPanel';
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="flex flex-col items-center">
          <AssistantOrb />

          <button
            onClick={toggleMic}
            className={`mt-8 flex items-center gap-2.5 px-6 py-3 rounded-full font-mono text-sm transition-all duration-300 ${
              micOn
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                : 'bg-secondary/60 text-muted-foreground border border-border/50 hover:text-foreground hover:border-border'
            }`}
          >
            {micOn ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
            {micOn ? `Listening for "${settings.wakeName}"...` : 'Enable Microphone'}
          </button>

          <p className="mt-4 text-muted-foreground/40 font-mono text-[11px] text-center">
            {micOn
              ? `Say "${settings.wakeName}" followed by a command`
              : 'Open in a new browser tab for voice to work'}
          </p>
        </div>

        {/* Command log overlay at bottom */}
        {commands.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 max-h-48">
            <CommandHistory />
          </div>
        )}
      </div>

      {/* Right panel — status */}
      <div className="w-56 border-l border-border/50 p-3 overflow-y-auto bg-[hsl(220,22%,7%)]/50">
        <StatusPanel />
      </div>
    </div>
  );
};
