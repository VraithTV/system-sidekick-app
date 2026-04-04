import { AssistantOrb } from '../AssistantOrb';
import { StatusPanel } from '../StatusPanel';
import { CommandHistory } from '../CommandHistory';
import { CommandInput } from '../CommandInput';
import { useJarvisStore } from '@/store/jarvisStore';
import { Film, Clock } from 'lucide-react';

export const DashboardView = () => {
  const { clips } = useJarvisStore();

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center orb */}
        <div className="lg:col-span-2 glass rounded-lg p-8 flex flex-col items-center justify-center min-h-[320px]">
          <AssistantOrb />
        </div>

        {/* Status */}
        <div className="space-y-4">
          <StatusPanel />
        </div>
      </div>

      {/* Command input */}
      <CommandInput />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command history */}
        <CommandHistory />

        {/* Recent clips */}
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
      </div>
    </div>
  );
};
