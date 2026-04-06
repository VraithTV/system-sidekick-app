import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

async function verifyAdmin(password: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ password }),
      }
    );
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

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
    const password = prompt('Enter admin password:');
    if (!password) return;

    const valid = await verifyAdmin(password);
    if (!valid) {
      toast({ title: 'Access denied', description: 'Incorrect admin password.', variant: 'destructive' });
      return;
    }

    const newValue = !enabled;
    setEnabled(newValue);
    await supabase
      .from('app_config')
      .update({ value: String(newValue), updated_at: new Date().toISOString() })
      .eq('key', 'maintenance_mode');

    toast({ title: 'Maintenance mode', description: newValue ? 'Enabled — desktop app will show maintenance.' : 'Disabled — desktop app works normally.' });
  }, [enabled]);

  return { enabled, loading, toggle, isElectron };
}
