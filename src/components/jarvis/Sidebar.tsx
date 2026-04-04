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
    <aside className="w-16 h-screen bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
      {/* Logo */}
      <div className="mb-6 glow-border rounded-xl p-1">
        <JarvisLogo size={34} />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
              activeView === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-secondary/50'
            }`}
          >
            {activeView === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r-full" />
            )}
            <Icon className="w-[18px] h-[18px]" strokeWidth={activeView === id ? 2 : 1.5} />
          </button>
        ))}
      </nav>

      {/* Bottom status indicator */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div title={systemStatus.micActive ? 'Microphone active' : 'Microphone off'}>
          <Circle className={`w-2.5 h-2.5 ${
            systemStatus.micActive
              ? 'text-success fill-success drop-shadow-[0_0_6px_hsl(var(--success)/0.6)]'
              : 'text-muted-foreground/20 fill-muted-foreground/20'
          }`} />
        </div>
      </div>
    </aside>
  );
};
