import { useJarvisStore } from '@/store/jarvisStore';
import { Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RoutinesView = () => {
  const { routines } = useJarvisStore();

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-primary glow-text tracking-wider">ROUTINES</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">Custom multi-step automations</p>
        </div>
        <Button variant="jarvis" size="sm"><Plus className="w-3 h-3 mr-1" />New Routine</Button>
      </div>

      {routines.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No routines created yet.</p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            Create routines like "Gaming Mode" or "Streaming Mode" to run multiple commands at once.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div key={routine.id} className="glass rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground">{routine.name}</h4>
              <p className="text-[10px] text-muted-foreground font-mono">Trigger: "{routine.trigger}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
