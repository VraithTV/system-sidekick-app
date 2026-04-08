import { useState } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { commonApps, toAppShortcut, type CommonApp } from '@/lib/commonApps';
import { getAppIcon } from '@/components/jarvis/AppIcons';
import { AppWindow, Plus, Trash2, X } from 'lucide-react';
import type { AppShortcut } from '@/types/jarvis';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const AppsView = () => {
  const { apps, addApp, removeApp, settings } = useJarvisStore();
  const t = createT(settings.language || 'en');
  const [showAdd, setShowAdd] = useState(false);

  const availableApps = commonApps.filter((ca) => !apps.some((a) => a.id === ca.id));

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
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-[12px] font-mono border border-primary/20 hover:bg-primary/15 transition-colors"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? t('apps.close') : t('apps.addApp')}
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border">
            <p className="text-[11px] text-muted-foreground font-mono mb-3 tracking-wide">
              {t('apps.available')}
            </p>
            {availableApps.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">{t('apps.allAdded')}</p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {availableApps.map((ca) => {
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
