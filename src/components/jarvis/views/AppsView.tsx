import { useJarvisStore } from '@/store/jarvisStore';
import { AppWindow, Plus } from 'lucide-react';

export const AppsView = () => {
  const { apps } = useJarvisStore();

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-sm text-primary glow-text tracking-wider">APPLICATIONS</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/20 hover:bg-primary/15 transition-colors">
          <Plus className="w-3 h-3" />
          Add App
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AppWindow className="w-8 h-8 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground/60 font-mono text-xs">No applications mapped yet</p>
          <p className="text-muted-foreground/30 font-mono text-[10px] mt-1">
            Add apps to create voice shortcuts and aliases
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
          {apps.map((app) => (
            <div key={app.id} className="glass rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <AppWindow className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{app.name}</p>
                <p className="text-[9px] text-muted-foreground/50 font-mono truncate">{app.path}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
