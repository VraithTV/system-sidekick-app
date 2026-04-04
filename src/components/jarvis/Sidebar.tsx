import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, AppWindow, Film, Zap, Settings, Circle, Minus, Square, X } from 'lucide-react';
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
    <aside className="w-52 h-screen bg-card flex flex-col shrink-0 select-none">
      {/* Title bar — desktop window chrome */}
      <div className="flex items-center justify-between h-9 px-3 bg-background/80 border-b border-border/60">
        <div className="flex items-center gap-2">
          <JarvisLogo size={14} />
          <span className="font-display text-[10px] tracking-[0.15em] text-foreground/60">JARVIS</span>
        </div>
        <div className="flex items-center">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 hover:bg-muted/50 transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 hover:bg-muted/50 transition-colors">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 hover:bg-destructive/80 hover:text-destructive-foreground transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col py-2 px-2 gap-px overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`relative flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded transition-all duration-150 text-left group ${
              activeView === id
                ? 'bg-primary/12 text-primary'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground/80'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-[6px] bottom-[6px] w-[2px] rounded-r bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            )}
            <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={activeView === id ? 2 : 1.5} />
            <span className="text-[11px] tracking-wide">{label}</span>
          </button>
        ))}
      </nav>

      {/* Status bar */}
      <div className="px-3 py-2 border-t border-border/40 bg-background/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle
              className={`h-[6px] w-[6px] shrink-0 ${
                systemStatus.micActive
                  ? 'fill-success text-success drop-shadow-[0_0_4px_hsl(var(--success)/0.5)]'
                  : 'fill-muted-foreground/20 text-muted-foreground/20'
              }`}
            />
            <span className="text-[9px] font-mono text-muted-foreground/50">
              {systemStatus.micActive ? 'MIC ON' : 'MIC OFF'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/30">v1.0</span>
        </div>
      </div>
    </aside>
  );
};
