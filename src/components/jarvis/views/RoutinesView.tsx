import { useJarvisStore } from '@/store/jarvisStore';
import { Zap, Plus } from 'lucide-react';

export const RoutinesView = () => {
  const { routines } = useJarvisStore();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">ROUTINES</h2>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-[12px] font-mono border border-primary/20 hover:bg-primary/15 transition-colors">
            <Plus className="w-4 h-4" />
            New Routine
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[55vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <Zap className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground/50 text-sm font-medium">No routines created</p>
            <p className="text-muted-foreground font-mono text-[11px] mt-2 max-w-[280px]">
              Create multi-step automations like "Gaming Mode" or "Stream Setup"
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border hover:border-primary/20 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground/85">{routine.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">"{routine.trigger}"</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${routine.enabled ? 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.4)]' : 'bg-muted-foreground/25'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
