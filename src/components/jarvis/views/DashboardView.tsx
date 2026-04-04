import { useEffect, useState } from 'react';
import { AssistantOrb } from '../AssistantOrb';
import { StatusPanel } from '../StatusPanel';
import { CommandHistory } from '../CommandHistory';
import { CommandInput } from '../CommandInput';
import { useJarvisStore } from '@/store/jarvisStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Film, Clock, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardView = () => {
  const { clips, commands, settings } = useJarvisStore();
  const { startListening, stopListening, sendTextCommand } = useVoiceAssistant();
  const [micOn, setMicOn] = useState(false);

  const toggleMic = () => {
    if (micOn) {
      stopListening();
      setMicOn(false);
    } else {
      startListening();
      setMicOn(true);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center orb + mic toggle */}
        <div className="lg:col-span-2 glass rounded-lg p-8 flex flex-col items-center justify-center min-h-[320px] relative">
          <AssistantOrb />
          <div className="mt-6">
            <Button
              variant={micOn ? 'default' : 'jarvis'}
              size="lg"
              onClick={toggleMic}
              className="gap-2"
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              {micOn ? `Listening for "${settings.wakeName}"...` : 'Enable Microphone'}
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <StatusPanel />
        </div>
      </div>

      {/* Command input */}
      <CommandInput onSendCommand={sendTextCommand} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command history */}
        {commands.length > 0 && <CommandHistory />}

        {/* Recent clips */}
        {clips.length > 0 && (
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">Recent Clips</h3>
            <div className="space-y-2">
              {clips.slice(0, 3).map((clip) => (
                <div key={clip.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Film className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-foreground truncate">{clip.filename}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{clip.duration}s</span>
                      <span>·</span>
                      <span>{clip.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty state when nothing yet */}
      {commands.length === 0 && clips.length === 0 && (
        <div className="glass rounded-lg p-8 text-center">
          <p className="text-muted-foreground font-mono text-sm">
            {micOn 
              ? `Say "${settings.wakeName}" followed by a command to get started.`
              : 'Enable the microphone or type a command below to interact with the assistant.'
            }
          </p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-2">
            Try: "{settings.wakeName}, open Chrome" or "{settings.wakeName}, start recording"
          </p>
        </div>
      )}
    </div>
  );
};
