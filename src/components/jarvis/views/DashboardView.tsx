import { useState } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { CommandHistory } from '../CommandHistory';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Main orb area */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-lg w-full">
        <AssistantOrb />

        <div className="mt-8">
          <Button
            variant={micOn ? 'default' : 'jarvis'}
            size="lg"
            onClick={toggleMic}
            className="gap-2 text-base px-8 py-6"
          >
            {micOn ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
            {micOn ? `Listening for "${settings.wakeName}"...` : 'Enable Microphone'}
          </Button>
        </div>

        {/* Hint text */}
        <div className="mt-6 text-center space-y-2">
          {micOn ? (
            <p className="text-muted-foreground font-mono text-sm animate-pulse">
              Say "{settings.wakeName}" followed by a command...
            </p>
          ) : (
            <p className="text-muted-foreground font-mono text-sm">
              Tap the button above to start talking to {settings.wakeName}
            </p>
          )}
          <p className="text-muted-foreground/50 font-mono text-xs">
            Try: "{settings.wakeName}, open Chrome" · "{settings.wakeName}, what's the weather?"
          </p>
        </div>

        {/* iframe warning */}
        <div className="mt-4 glass rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span>Voice works best when opened in a new tab</span>
        </div>
      </div>

      {/* Recent conversation */}
      {commands.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <CommandHistory />
        </div>
      )}
    </div>
  );
};
