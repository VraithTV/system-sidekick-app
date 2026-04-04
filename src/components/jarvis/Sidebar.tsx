import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, AppWindow, Film, Zap, Settings, Circle } from 'lucide-react';
import { JarvisLogo } from './JarvisLogo';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'clips', label: 'Clips', icon: Film },
  { id: 'routines', label: 'Routines', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeView, setActiveView, systemStatus } = useJarvisStore();

  return (
    <aside className="w-20 h-screen bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.12)]">
          <JarvisLogo size={30} />
        </div>
        <div className="text-center">
          <p className="font-display text-[9px] tracking-[0.22em] text-foreground/70">JARVIS</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground/35">desktop</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
              activeView === id
                ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.14)]'
                : 'text-muted-foreground/40 hover:bg-secondary/70 hover:text-muted-foreground/80'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <Icon className="h-[18px] w-[18px]" strokeWidth={activeView === id ? 2 : 1.65} />
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-3 pb-2">
        <div title={systemStatus.micActive ? 'Microphone active' : 'Microphone off'}>
          <Circle
            className={`h-2.5 w-2.5 ${
              systemStatus.micActive
                ? 'fill-success text-success drop-shadow-[0_0_6px_hsl(var(--success)/0.6)]'
                : 'fill-muted-foreground/20 text-muted-foreground/20'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
