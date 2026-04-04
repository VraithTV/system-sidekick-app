import { useJarvisStore } from '@/store/jarvisStore';
import { Zap, Play, Plus, ChevronRight } from 'lucide-react';
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

      <div className="space-y-3">
        {routines.map((routine) => (
          <div key={routine.id} className="glass rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${routine.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Zap className={`w-4 h-4 ${routine.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{routine.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">Trigger: "{routine.trigger}"</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${routine.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {routine.enabled ? 'Active' : 'Disabled'}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap pl-13">
              {routine.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">{action}</span>
                  {i < routine.actions.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
