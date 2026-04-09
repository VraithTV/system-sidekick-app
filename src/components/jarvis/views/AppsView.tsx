import { useState, useMemo } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { commonApps, categoryLabels, categoryOrder, toAppShortcut, type CommonApp } from '@/lib/commonApps';
import { getAppIcon } from '@/components/jarvis/AppIcons';
import { AppWindow, Plus, Trash2, X, Search } from 'lucide-react';
import type { AppShortcut } from '@/types/jarvis';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const AppsView = () => {
  const { apps, addApp, removeApp, settings } = useJarvisStore();
  const t = createT(settings.language || 'en');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const availableApps = commonApps.filter((ca) => !apps.some((a) => a.id === ca.id));

  const filteredApps = useMemo(() => {
    let filtered = availableApps;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((ca) =>
        ca.name.toLowerCase().includes(q) ||
        ca.aliases.some((a) => a.includes(q)) ||
        ca.category.includes(q)
      );
    }
    if (activeCategory) {
      filtered = filtered.filter((ca) => ca.category === activeCategory);
    }
    return filtered;
  }, [availableApps, search, activeCategory]);

  const groupedApps = useMemo(() => {
    const groups: Record<string, CommonApp[]> = {};
    for (const app of filteredApps) {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    }
    return groups;
  }, [filteredApps]);

  const handleAdd = (ca: CommonApp) => {
    addApp(toAppShortcut(ca));
  };

  const handleLaunch = (app: AppShortcut) => {
    if (isElectron) {
      (window as any).electronAPI.openApp(app.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">{t('apps.title')}</h2>
          <button
            onClick={() => { setShowAdd(!showAdd); setSearch(''); setActiveCategory(null); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-[12px] font-mono border border-primary/20 hover:bg-primary/15 transition-colors"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? t('apps.close') : t('apps.addApp')}
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border">
            {/* Search bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wide transition-colors ${
                  !activeCategory ? 'bg-primary/15 text-primary border border-primary/25' : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/40'
                }`}
              >
                All
              </button>
              {categoryOrder.map((cat) => {
                const count = availableApps.filter((a) => a.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wide transition-colors ${
                      activeCategory === cat ? 'bg-primary/15 text-primary border border-primary/25' : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/40'
                    }`}
                  >
                    {categoryLabels[cat]} ({count})
                  </button>
                );
              })}
            </div>

            {filteredApps.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-4">
                {search ? 'No apps match your search.' : t('apps.allAdded')}
              </p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4">
                {categoryOrder.map((cat) => {
                  const catApps = groupedApps[cat];
                  if (!catApps || catApps.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="text-[10px] font-mono text-primary/50 tracking-[0.15em] uppercase mb-2">
                        {categoryLabels[cat]}
                      </p>
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                        {catApps.map((ca) => {
                          const Icon = getAppIcon(ca.id);
                          return (
                            <button
                              key={ca.id}
                              onClick={() => handleAdd(ca)}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                            >
                              <Icon size={22} />
                              <p className="text-[12px] text-foreground/80 truncate">{ca.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[55vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <AppWindow className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground/50 text-sm font-medium">{t('apps.noApps')}</p>
            <p className="text-muted-foreground font-mono text-[11px] mt-2 max-w-[260px]">
              {t('apps.noAppsHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {apps.map((app) => {
              const Icon = getAppIcon(app.id);
              return (
                <div
                  key={app.id}
                  className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border hover:border-primary/20 transition-colors group cursor-pointer"
                  onClick={() => handleLaunch(app)}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground/85 truncate">{app.name}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeApp(app.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
