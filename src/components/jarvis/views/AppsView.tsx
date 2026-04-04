import { useJarvisStore } from '@/store/jarvisStore';
import { AppWindow, Plus } from 'lucide-react';

export const AppsView = () => {
  const { apps } = useJarvisStore();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-sm text-primary/80 tracking-[0.15em]">APPLICATIONS</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-mono border border-primary/15 hover:bg-primary/15 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add App
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <AppWindow className="w-7 h-7 text-muted-foreground/15" />
            </div>
            <p className="text-muted-foreground/50 text-sm">No applications mapped</p>
            <p className="text-muted-foreground/25 font-mono text-[11px] mt-2 max-w-[240px]">
              Add apps to create voice shortcuts and quick-launch aliases
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {apps.map((app) => (
              <div key={app.id} className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border hover:border-primary/15 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <AppWindow className="w-5 h-5 text-primary/50" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-foreground/80 truncate">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground/30 font-mono truncate">{app.path}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
