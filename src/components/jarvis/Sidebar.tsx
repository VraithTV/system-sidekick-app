import { useJarvisStore } from '@/store/jarvisStore';
import { LayoutDashboard, MessageSquare, AppWindow, Film, Zap, Settings, Circle, Activity, Palette } from 'lucide-react';
import { JarvisLogo } from '@/components/jarvis/JarvisLogo';
import { createT } from '@/lib/i18n';

const navKeys = [
  { id: 'dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'chat', key: 'nav.chat', icon: MessageSquare },
  { id: 'apps', key: 'nav.apps', icon: AppWindow },
  { id: 'clips', key: 'nav.clips', icon: Film },
  { id: 'routines', key: 'nav.routines', icon: Zap },
  { id: 'system', key: 'nav.system', icon: Activity },
  { id: 'themes', key: 'nav.themes', icon: Palette },
  { id: 'settings', key: 'nav.settings', icon: Settings },
];

export const Sidebar = ({ onNavClick }: { onNavClick?: () => void }) => {
  const { activeView, setActiveView, systemStatus, settings } = useJarvisStore();
  const t = createT(settings.language || 'en');

  const handleNav = (id: string) => {
    setActiveView(id);
    onNavClick?.();
  };

  return (
    <aside className="w-52 h-screen bg-card border-r border-border flex flex-col shrink-0 select-none">
      {/* Logo header */}
      <div className="flex items-center gap-3 px-4 h-16 titlebar-drag">
        <JarvisLogo size={36} className="shrink-0" static={false} />
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-[0.3em] font-display text-muted-foreground/70">JARVIS</span>
          <span className="text-[9px] font-mono text-muted-foreground/30 tracking-wider">V1.2 BETA</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col pt-1 pb-3 px-2 gap-px overflow-y-auto">
        {navKeys.map(({ id, key, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNav(id)}
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
            <span className="text-[11px] tracking-wide">{t(key)}</span>
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
              {systemStatus.micActive ? t('status.micOn') : t('status.micOff')}
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/30">JARVIS v1.2</span>
        </div>
      </div>
    </aside>
  );
};
