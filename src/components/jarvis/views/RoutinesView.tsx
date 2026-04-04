import { useJarvisStore } from '@/store/jarvisStore';
import { Zap, Plus } from 'lucide-react';

export const RoutinesView = () => {
  const { routines } = useJarvisStore();

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-sm text-primary glow-text tracking-wider">ROUTINES</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/20 hover:bg-primary/15 transition-colors">
          <Plus className="w-3 h-3" />
          New Routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Zap className="w-8 h-8 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground/60 font-mono text-xs">No routines created yet</p>
          <p className="text-muted-foreground/30 font-mono text-[10px] mt-1">
            Create routines like "Gaming Mode" or "Streaming Mode"
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {routines.map((routine) => (
            <div key={routine.id} className="flex items-center gap-3 p-3 rounded-md bg-secondary/30 border border-border/20 hover:bg-secondary/40 transition-colors">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{routine.name}</p>
                <p className="text-[9px] text-muted-foreground/50 font-mono">"{routine.trigger}"</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${routine.enabled ? 'bg-success' : 'bg-muted-foreground/20'}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
