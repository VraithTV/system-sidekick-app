import { useJarvisStore } from '@/store/jarvisStore';
import { Mic } from 'lucide-react';

export const CommandHistory = () => {
  const { commands } = useJarvisStore();

  return (
    <div className="bg-[hsl(220,22%,7%)]/90 backdrop-blur-md rounded-lg border border-border/30 p-3">
      <h3 className="font-display text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-2">Recent</h3>
      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {commands.slice(0, 5).map((cmd) => (
          <div key={cmd.id} className="flex gap-2 text-[11px] animate-fade-in-up">
            <Mic className="w-3 h-3 text-primary/40 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-foreground/70">"{cmd.text}"</span>
              <span className="text-primary/60 ml-1.5">— {cmd.response.slice(0, 80)}{cmd.response.length > 80 ? '...' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
