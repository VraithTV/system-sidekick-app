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
    <aside className="w-48 h-screen bg-card border-r border-border flex flex-col py-5 shrink-0">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary glow-border shrink-0">
          <JarvisLogo size={24} />
        </div>
        <div>
          <p className="font-display text-[11px] tracking-[0.18em] text-foreground/80">JARVIS</p>
          <p className="font-mono text-[8px] text-muted-foreground/50 tracking-wider">v1.0 · ONLINE</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
              activeView === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground/70'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
            )}
            <Icon className="h-4 w-4 shrink-0" strokeWidth={activeView === id ? 2 : 1.5} />
            <span className="text-[12px] font-mono tracking-wide">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="px-5 pt-3 border-t border-border/50 mt-2">
        <div className="flex items-center gap-2.5">
          <Circle
            className={`h-2.5 w-2.5 shrink-0 ${
              systemStatus.micActive
                ? 'fill-success text-success drop-shadow-[0_0_8px_hsl(var(--success)/0.6)]'
                : 'fill-muted-foreground/25 text-muted-foreground/25'
            }`}
          />
          <span className="text-[10px] font-mono text-muted-foreground/60">
            {systemStatus.micActive ? 'Mic Active' : 'Mic Off'}
          </span>
        </div>
      </div>
    </aside>
  );
};
