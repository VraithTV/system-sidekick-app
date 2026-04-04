import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, Keyboard } from 'lucide-react';

export const CommandHistory = () => {
  const { commands } = useJarvisStore();

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">Command Log</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {commands.map((cmd, i) => (
          <div key={cmd.id} className="animate-fade-in-up border-l-2 border-primary/30 pl-3 py-1.5" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              {cmd.type === 'voice' ? <Mic className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
              <span className="font-mono">{cmd.timestamp.toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-foreground font-medium">"{cmd.text}"</p>
            <p className="text-xs text-primary/80 mt-0.5 font-mono">{cmd.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
