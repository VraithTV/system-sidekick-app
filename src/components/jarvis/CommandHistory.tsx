import { useJarvisStore } from '@/store/jarvisStore';
import { Mic } from 'lucide-react';

export const CommandHistory = () => {
  const { commands } = useJarvisStore();

  return (
    <div className="glass rounded-lg px-4 py-3">
      <div className="space-y-2 max-h-36 overflow-y-auto">
        {commands.slice(0, 4).map((cmd, i) => (
          <div key={cmd.id} className="flex gap-2.5 text-[11px] leading-relaxed animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <Mic className="w-3.5 h-3.5 text-primary/50 mt-[2px] shrink-0" />
            <div className="min-w-0">
              <span className="text-foreground/70 font-mono">"{cmd.text}"</span>
              <span className="text-primary/50 ml-1.5">— {cmd.response.slice(0, 60)}{cmd.response.length > 60 ? '…' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
