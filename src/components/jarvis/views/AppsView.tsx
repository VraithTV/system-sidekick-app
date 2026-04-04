import { useJarvisStore } from '@/store/jarvisStore';
import { AppWindow, Plus } from 'lucide-react';

export const AppsView = () => {
  const { apps } = useJarvisStore();

  return (
    <div className="flex-1 p-5 overflow-y-auto grid-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,hsl(222,28%,5%)_100%)] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xs text-primary/80 tracking-[0.2em]">APPLICATIONS</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/8 text-primary/70 text-[10px] font-mono border border-primary/10 hover:bg-primary/12 hover:text-primary transition-colors">
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[65vh] text-center">
            <div className="w-14 h-14 rounded-xl bg-[hsl(222,20%,9%)] border border-[hsl(222,15%,12%)] flex items-center justify-center mb-4">
              <AppWindow className="w-6 h-6 text-muted-foreground/15" />
            </div>
            <p className="text-muted-foreground/40 font-mono text-[11px]">No applications mapped</p>
            <p className="text-muted-foreground/20 font-mono text-[9px] mt-1 max-w-[200px]">
              Add apps to create voice shortcuts and aliases
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            {apps.map((app) => (
              <div key={app.id} className="glass-hover rounded-lg p-3 flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-md bg-primary/8 flex items-center justify-center shrink-0">
                  <AppWindow className="w-4 h-4 text-primary/50" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-foreground/80 truncate">{app.name}</p>
                  <p className="text-[9px] text-muted-foreground/30 font-mono truncate">{app.path}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
