import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, AppWindow, Film, Zap, Settings, Circle, Activity, MessageSquare, Brain, Eye } from 'lucide-react';
import { JarvisLogo } from './JarvisLogo';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'clips', label: 'Clips', icon: Film },
  { id: 'meetings', label: 'Meetings', icon: MessageSquare, comingSoon: true },
  { id: 'memory', label: 'Memory', icon: Brain, comingSoon: true },
  { id: 'vision', label: 'Vision', icon: Eye, comingSoon: true },
  { id: 'routines', label: 'Routines', icon: Zap },
  { id: 'system', label: 'System', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeView, setActiveView, systemStatus } = useJarvisStore();

  return (
    <aside className="w-52 h-screen bg-card border-r border-border flex flex-col shrink-0 select-none">
      {/* Logo header — draggable region */}
      <div className="flex items-center gap-2.5 px-4 h-14 titlebar-drag">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary shrink-0">
          <JarvisLogo size={18} />
        </div>
        <div>
          <p className="font-display text-[10px] tracking-[0.15em] text-foreground/70">JARVIS</p>
          <p className="font-mono text-[8px] text-muted-foreground/40 tracking-wider">v1.0</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col pt-1 pb-3 px-2 gap-px overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, comingSoon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`relative flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded transition-all duration-150 text-left ${
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
            {comingSoon ? (
              <span className="ml-auto rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-[0.14em] text-primary/70">
                Dev
              </span>
            ) : null}
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
          <span className="text-[9px] font-mono text-muted-foreground/30">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};
