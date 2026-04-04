import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, AppWindow, Film, Zap, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'apps', label: 'Applications', icon: AppWindow },
  { id: 'clips', label: 'Clips', icon: Film },
  { id: 'routines', label: 'Routines', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeView, setActiveView, settings } = useJarvisStore();

  return (
    <aside className="w-16 lg:w-56 h-screen bg-card/50 border-r border-border flex flex-col py-4 shrink-0">
      <div className="px-3 lg:px-4 mb-8">
        <h1 className="font-display text-sm lg:text-lg text-primary glow-text tracking-wider hidden lg:block">
          {settings.wakeName.toUpperCase()}
        </h1>
        <span className="font-display text-primary glow-text text-lg lg:hidden block text-center">J</span>
        <p className="text-[10px] text-muted-foreground font-mono hidden lg:block">AI Desktop Assistant</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-mono transition-all duration-200 ${
              activeView === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 lg:px-4 mt-auto">
        <div className="glass rounded-md p-2 text-center">
          <div className="w-2 h-2 rounded-full bg-success mx-auto mb-1" />
          <span className="text-[10px] text-muted-foreground font-mono hidden lg:block">System Online</span>
        </div>
      </div>
    </aside>
  );
};
