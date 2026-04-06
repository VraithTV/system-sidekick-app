import { Construction } from 'lucide-react';

export const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/**
 * Maintenance mode: flip this flag to true/false.
 * When true AND running in Electron, the maintenance screen is shown.
 * The web preview is never blocked so you can always test changes.
 */
export const MAINTENANCE_ENABLED = false;

export const isMaintenanceMode = isElectron && MAINTENANCE_ENABLED;

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
