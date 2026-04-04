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
    <aside className="w-14 h-screen bg-[hsl(222,26%,5%)] border-r border-[hsl(222,15%,10%)] flex flex-col items-center py-2.5 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mb-5 glow-border">
        <span className="font-display text-xs text-primary font-semibold glow-text">
          {settings.wakeName[0]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${
              activeView === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-[hsl(222,20%,9%)]'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r-full" />
            )}
            <Icon className="w-[17px] h-[17px]" strokeWidth={activeView === id ? 2 : 1.5} />
          </button>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="flex flex-col items-center gap-2">
        <div title={systemStatus.micActive ? 'Microphone active' : 'Microphone off'} className="relative">
          <Circle className={`w-2 h-2 ${
            systemStatus.micActive
              ? 'text-success fill-success drop-shadow-[0_0_4px_hsl(var(--success)/0.5)]'
              : 'text-muted-foreground/20 fill-muted-foreground/20'
          }`} />
        </div>
      </div>
    </aside>
  );
};
