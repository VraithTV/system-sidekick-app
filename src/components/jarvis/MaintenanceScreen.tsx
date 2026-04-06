import { Construction } from 'lucide-react';

export const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/**
 * Maintenance mode logic:
 * - URL param `?maintenance=on`  → forced ON (any environment)
 * - URL param `?maintenance=off` → forced OFF (any environment)
 * - No param → ON in Electron, OFF in web preview
 *
 * The param is persisted to localStorage so you only need to set it once.
 */
const STORAGE_KEY = 'jarvis_maintenance_override';

function resolveMaintenanceMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  const urlVal = params.get('maintenance');

  if (urlVal === 'on' || urlVal === 'off') {
    try { localStorage.setItem(STORAGE_KEY, urlVal); } catch {}
    return urlVal === 'on';
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'on') return true;
    if (stored === 'off') return false;
  } catch {}

  return isElectron;
}

export const isMaintenanceMode = resolveMaintenanceMode();

export const MaintenanceScreen = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary/60" />
      </div>
      <h1 className="font-display text-xl tracking-[0.15em] text-foreground/80 mb-3">
        Scheduled Maintenance
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-2">
        Jarvis is currently undergoing maintenance and improvements. Please check back soon.
      </p>
      <span className="mt-4 text-[9px] font-mono text-primary/40 tracking-widest uppercase">
        We'll be back shortly
      </span>
    </div>
  </div>
);
