import { useJarvisStore } from '@/store/jarvisStore';
import { Mic } from 'lucide-react';

export const CommandHistory = () => {
  const { commands } = useJarvisStore();

  return (
    <div className="bg-[hsl(222,26%,5%)]/95 backdrop-blur-lg rounded-md border border-[hsl(222,15%,10%)] px-3 py-2.5">
      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {commands.slice(0, 4).map((cmd, i) => (
          <div key={cmd.id} className="flex gap-2 text-[10px] leading-relaxed animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <Mic className="w-3 h-3 text-primary/30 mt-[3px] shrink-0" />
            <div className="min-w-0">
              <span className="text-foreground/60 font-mono">"{cmd.text}"</span>
              <span className="text-primary/40 ml-1">— {cmd.response.slice(0, 60)}{cmd.response.length > 60 ? '…' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
