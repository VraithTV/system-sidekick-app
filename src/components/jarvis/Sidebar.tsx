import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, AppWindow, Film, Zap, Settings, Circle } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'clips', label: 'Clips', icon: Film },
  { id: 'routines', label: 'Routines', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeView, setActiveView, settings, systemStatus } = useJarvisStore();

  return (
    <aside className="w-[52px] h-screen bg-[hsl(220,22%,7%)] border-r border-border/50 flex flex-col items-center py-3 shrink-0">
      {/* Logo */}
      <div className="mb-6 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="font-display text-[10px] text-primary font-bold">{settings.wakeName[0]}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
              activeView === id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
          </button>
        ))}
      </nav>

      {/* Status dot */}
      <div className="mt-auto" title={systemStatus.micActive ? 'Mic active' : 'Mic off'}>
        <Circle className={`w-2.5 h-2.5 ${systemStatus.micActive ? 'text-success fill-success' : 'text-muted-foreground/30 fill-muted-foreground/30'}`} />
      </div>
    </aside>
  );
};
