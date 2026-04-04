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
    <div className="flex flex-1 overflow-hidden bg-background">
      <div className="relative flex flex-1 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.10)_0%,transparent_38%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]" />

        <div className="relative flex w-full items-center justify-center px-8 py-10">
          <div className="w-full max-w-[820px] rounded-[2rem] border border-border bg-card/95 p-10 shadow-[0_30px_90px_hsl(var(--background)/0.6)] backdrop-blur-xl">
            <div className="mb-10 flex items-start justify-between gap-6 border-b border-border pb-6">
              <div>
                <p className="font-display text-[10px] tracking-[0.35em] text-primary/80">VOICE CONSOLE</p>
                <h2 className="mt-3 text-2xl font-medium text-foreground">Desktop command center</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Trigger commands, previews, and responses from a focused desktop workspace.
                </p>
              </div>

              <div className="rounded-full border border-border bg-secondary px-4 py-2 font-mono text-[11px] text-foreground/60">
                {settings.wakeName} ready
              </div>
            </div>

            <div className="flex flex-col items-center">
              <AssistantOrb />

              <button
                onClick={toggleMic}
                className={`mt-12 flex items-center gap-2.5 rounded-full px-7 py-3.5 font-mono text-sm tracking-wide transition-all duration-300 ${
                  micOn
                    ? 'bg-primary text-primary-foreground shadow-[0_0_32px_hsl(var(--primary)/0.28)]'
                    : 'bg-secondary text-foreground border border-border hover:border-primary/25 hover:text-foreground'
                }`}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {micOn ? `Listening for "${settings.wakeName}"` : 'Enable Microphone'}
              </button>

              <p className="mt-4 text-center font-mono text-[11px] tracking-wide text-foreground/55">
                {micOn
                  ? `Say "${settings.wakeName}" followed by a command`
                  : 'Click to activate voice control'}
              </p>
            </div>
          </div>
        </div>

        {commands.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-8">
            <div className="pointer-events-auto w-full max-w-[820px]">
              <CommandHistory />
            </div>
          </div>
        )}
      </div>

      <div className="w-60 border-l border-border bg-card p-5">
        <StatusPanel />
      </div>
    </div>
  );
};
