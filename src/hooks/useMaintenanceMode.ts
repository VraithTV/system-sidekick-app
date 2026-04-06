import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export function useMaintenanceMode() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFlag = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();
      setEnabled(data?.value === 'true');
    } catch {
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlag(); }, [fetchFlag]);

  const toggle = useCallback(async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    await supabase
      .from('app_config')
      .update({ value: String(newValue), updated_at: new Date().toISOString() })
      .eq('key', 'maintenance_mode');
  }, [enabled]);

  return { enabled, loading, toggle, isElectron };
}
