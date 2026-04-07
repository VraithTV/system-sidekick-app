import { Construction } from "lucide-react";
import { TitleBar } from "./TitleBar";
import { useState, useEffect } from "react";

export const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI;
export const LOCAL_MAINTENANCE_OVERRIDE: boolean | null = null;

export function useMaintenanceMode() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (LOCAL_MAINTENANCE_OVERRIDE !== null) {
      setIsMaintenance(LOCAL_MAINTENANCE_OVERRIDE);
      setLoading(false);
      return;
    }

    async function check() {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'maintenance_enabled')
          .maybeSingle();

        if (!cancelled) {
          setIsMaintenance(data?.value === 'true');
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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
