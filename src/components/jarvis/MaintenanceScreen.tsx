import { Construction } from "lucide-react";
import { TitleBar } from "./TitleBar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI;

/**
 * Maintenance mode is now fetched from the database (app_config table).
 * Set the key "maintenance_enabled" to "true" or "false" in the app_config table.
 * This way the Electron app checks on startup without needing a rebuild.
 */

export function useMaintenanceMode() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'maintenance_enabled')
          .maybeSingle();

        if (!cancelled) {
          setIsMaintenance(data?.value === 'true');
        }
      } catch {
        // If fetch fails (offline, etc.), don't block the app
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();

    // Re-check every 60 seconds so Electron picks up changes
    const interval = setInterval(check, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { isMaintenance: isElectron && isMaintenance, loading };
}

export const MaintenanceScreen = () => (
  <div className="flex flex-col h-screen w-screen bg-background">
    <TitleBar />
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-primary/60" />
        </div>
        <h1 className="font-display text-xl tracking-[0.15em] text-foreground/80 mb-3">Scheduled Maintenance</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-2">
          Jarvis is currently undergoing maintenance and improvements. Please check back soon.
        </p>
        <span className="mt-4 text-[9px] font-mono text-primary/40 tracking-widest uppercase">
          We'll be back shortly
        </span>
      </div>
    </div>
  </div>
);
