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
    <aside className="w-[72px] h-screen bg-card border-r border-border flex flex-col items-center py-5 shrink-0">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary glow-border">
          <JarvisLogo size={28} />
        </div>
        <p className="font-display text-[8px] tracking-[0.2em] text-foreground/50">JARVIS</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 gap-1 ${
              activeView === id
                ? 'bg-primary/12 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground/70'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-1/2 h-6 w-[2.5px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
            )}
            <Icon className="h-[18px] w-[18px]" strokeWidth={activeView === id ? 2 : 1.5} />
            <span className="text-[7px] font-mono tracking-wide opacity-60">{label.slice(0, 5)}</span>
          </button>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="flex flex-col items-center gap-3 pb-1">
        <div title={systemStatus.micActive ? 'Mic active' : 'Mic off'}>
          <Circle
            className={`h-3 w-3 ${
              systemStatus.micActive
                ? 'fill-success text-success drop-shadow-[0_0_8px_hsl(var(--success)/0.6)]'
                : 'fill-muted-foreground/25 text-muted-foreground/25'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
