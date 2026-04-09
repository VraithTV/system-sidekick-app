import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CURRENT_VERSION = '1.2.2';
const UPDATE_URL = 'https://jarvisai-hub.vercel.app';

function parseVersion(v: string) {
  const parts = v.replace(/^v/, '').split('.').map(Number);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function isOlderThan(current: string, minimum: string): boolean {
  const c = parseVersion(current);
  const m = parseVersion(minimum);
  if (c.major !== m.major) return c.major < m.major;
  if (c.minor !== m.minor) return c.minor < m.minor;
  return c.patch < m.patch;
}

export function useForceUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [minVersion, setMinVersion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'min_version')
          .maybeSingle();

        if (data?.value && isOlderThan(CURRENT_VERSION, data.value)) {
          setMinVersion(data.value);
          setNeedsUpdate(true);
        }
      } catch {
        // If we can't reach the server, don't block the app
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  return { needsUpdate, minVersion, loading };
}

export function ForceUpdateScreen({ minVersion }: { minVersion: string }) {
  return (
    <div className="flex h-screen bg-background items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>

        <h1 className="font-display text-lg uppercase tracking-[0.14em] text-foreground">
          Update Required
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your version of Jarvis AI (v{CURRENT_VERSION}) is no longer supported.
          Version {minVersion} or newer is required.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Please download the latest version from the official website and reinstall.
          Make sure to uninstall the old version first.
        </p>

        <a
          href={UPDATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Download Latest Version
        </a>

        <p className="mt-4 text-xs text-muted-foreground/60 font-mono">
          Current: v{CURRENT_VERSION}
        </p>
      </div>
    </div>
  );
}
