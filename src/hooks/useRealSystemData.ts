import { useState, useEffect, useCallback } from 'react';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export interface RealSystemData {
  cpu: { name: string; cores: number; threads: number };
  ram: { used: number; total: number; percent: number };
  gpu: { name: string; vendor: string };
  storage: { name: string; total: number; used: number; type: string }[];
  network: { download: number; upload: number; ping: number; type: string; testing: boolean };
  processes: { name: string; cpu: number; ram: number }[];
  uptime: string;
  platform: string;
}

/* ── Browser-only fallbacks ─────────────────────────────────── */

function getGPUInfo(): { name: string; vendor: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        return {
          vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'Unknown',
          name: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Unknown GPU',
        };
      }
    }
  } catch {}
  return { name: 'No GPU detected', vendor: '' };
}

function getPlatform(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
}

function formatSessionUptime(): string {
  const s = Math.floor(performance.now() / 1000);
  const m = Math.floor(s / 60) % 60;
  const h = Math.floor(s / 3600) % 24;
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

async function measureNetworkSpeed(): Promise<{ download: number; upload: number; ping: number }> {
  const results = { download: 0, upload: 0, ping: 0 };
  try {
    const pingStart = performance.now();
    await fetch('https://www.google.com/generate_204', { mode: 'no-cors', cache: 'no-store' });
    results.ping = Math.round(performance.now() - pingStart);

    const dlStart = performance.now();
    const resp = await fetch('https://speed.cloudflare.com/__down?bytes=500000', { cache: 'no-store' });
    const blob = await resp.blob();
    const dlTime = (performance.now() - dlStart) / 1000;
    results.download = Math.round((blob.size * 8 / dlTime / 1_000_000) * 10) / 10;

    const uploadData = new Uint8Array(100000);
    const ulStart = performance.now();
    try { await fetch('https://speed.cloudflare.com/__up', { method: 'POST', body: uploadData, mode: 'no-cors', cache: 'no-store' }); } catch {}
    const ulTime = (performance.now() - ulStart) / 1000;
    results.upload = Math.round((uploadData.byteLength * 8 / ulTime / 1_000_000) * 10) / 10;
  } catch {}
  return results;
}

function getBrowserInitialData(): RealSystemData {
  const gpu = getGPUInfo();
  const cores = navigator.hardwareConcurrency || 0;
  const devMem = (navigator as any).deviceMemory;
  const perf = (performance as any);
  const heapTotal = perf.memory ? Math.round((perf.memory.jsHeapSizeLimit / (1024 ** 3)) * 100) / 100 : (devMem || 0);
  const heapUsed = perf.memory ? Math.round((perf.memory.usedJSHeapSize / (1024 ** 3)) * 100) / 100 : 0;

  return {
    cpu: { name: `${cores}-Core Processor`, cores, threads: cores },
    ram: { used: heapUsed, total: heapTotal, percent: heapTotal > 0 ? (heapUsed / heapTotal) * 100 : 0 },
    gpu: { name: gpu.name, vendor: gpu.vendor },
    storage: [],
    network: { download: 0, upload: 0, ping: 0, type: (navigator as any).connection?.effectiveType || 'unknown', testing: false },
    processes: [],
    uptime: formatSessionUptime(),
    platform: getPlatform(),
  };
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useRealSystemData() {
  const [data, setData] = useState<RealSystemData>(getBrowserInitialData);
  const [speedTested, setSpeedTested] = useState(false);

  // Electron: fetch real system data
  const fetchElectronData = useCallback(async () => {
    if (!isElectron) return;
    try {
      const api = (window as any).electronAPI;
      const sys = await api.getSystemInfo();
      setData((prev) => ({
        ...prev,
        cpu: sys.cpu || prev.cpu,
        ram: sys.ram || prev.ram,
        gpu: sys.gpu || prev.gpu,
        storage: sys.storage || prev.storage,
        processes: sys.processes || prev.processes,
        uptime: sys.uptime || prev.uptime,
        platform: sys.platform || prev.platform,
      }));
    } catch (err) {
      console.warn('[System] Electron system info failed:', err);
    }
  }, []);

  // Initial load + periodic refresh
  useEffect(() => {
    if (isElectron) {
      fetchElectronData();
      const interval = setInterval(fetchElectronData, 5000);
      return () => clearInterval(interval);
    } else {
      // Browser: get storage estimate
      navigator.storage?.estimate?.().then((est) => {
        const totalGB = Math.round(((est.quota || 0) / (1024 ** 3)) * 10) / 10;
        const usedGB = Math.round(((est.usage || 0) / (1024 ** 3)) * 100) / 100;
        setData((prev) => ({ ...prev, storage: [{ name: 'Browser Storage', total: totalGB, used: usedGB, type: 'Quota' }] }));
      });
    }
  }, [fetchElectronData]);

  // Browser: live memory updates
  useEffect(() => {
    if (isElectron) return;
    const interval = setInterval(() => {
      const perf = (performance as any);
      if (perf.memory) {
        const used = Math.round((perf.memory.usedJSHeapSize / (1024 ** 3)) * 100) / 100;
        const total = Math.round((perf.memory.jsHeapSizeLimit / (1024 ** 3)) * 100) / 100;
        setData((prev) => ({ ...prev, ram: { used, total, percent: (used / total) * 100 }, uptime: formatSessionUptime() }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Network speed test
  const runSpeedTest = useCallback(async () => {
    setData((prev) => ({ ...prev, network: { ...prev.network, testing: true } }));
    const results = await measureNetworkSpeed();
    const connType = (navigator as any).connection?.effectiveType || 'unknown';
    setData((prev) => ({ ...prev, network: { ...results, type: connType, testing: false } }));
    setSpeedTested(true);
  }, []);

  useEffect(() => {
    if (!speedTested) runSpeedTest();
  }, [speedTested, runSpeedTest]);

  return { data, runSpeedTest, refreshSystemInfo: fetchElectronData };
}
