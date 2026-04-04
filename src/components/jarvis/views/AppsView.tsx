import { useJarvisStore } from '@/store/jarvisStore';
import { AppWindow, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppsView = () => {
  const { apps } = useJarvisStore();

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-primary glow-text tracking-wider">APPLICATIONS</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">Manage app shortcuts and aliases</p>
        </div>
        <Button variant="jarvis" size="sm">
          <Plus className="w-3 h-3 mr-1" />
          Add App
        </Button>
      </div>

      {apps.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <AppWindow className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No applications mapped yet.</p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            Add apps to create shortcuts and voice aliases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {apps.map((app) => (
            <div key={app.id} className="glass rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <AppWindow className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{app.name}</h4>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{app.path}</p>
                <div className="flex gap-1 mt-1">
                  {app.aliases.map((alias) => (
                    <span key={alias} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{alias}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
