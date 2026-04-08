import { useState, useEffect, useCallback } from 'react';

export interface RealSystemData {
  cpu: { name: string; cores: number; threads: number; usage: number };
  ram: { used: number; total: number; percent: number };
  gpu: { name: string; vendor: string };
  storage: { name: string; total: number; used: number; type: string }[];
  network: { download: number; upload: number; ping: number; type: string; testing: boolean };
  processes: { name: string; cpu: number; ram: number }[];
  uptime: string;
  platform: string;
}

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
  } catch { }
  return { name: 'GPU info unavailable', vendor: 'Unknown' };
}

function getPlatformInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

function formatUptime(): string {
  const perf = performance.now();
  const seconds = Math.floor(perf / 1000);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600) % 24;
  const d = Math.floor(seconds / 86400);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

async function getStorageInfo(): Promise<{ name: string; total: number; used: number; type: string }[]> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const totalGB = (est.quota || 0) / (1024 ** 3);
      const usedGB = (est.usage || 0) / (1024 ** 3);
      return [{ name: 'Browser Storage', total: Math.round(totalGB * 10) / 10, used: Math.round(usedGB * 100) / 100, type: 'Quota' }];
    }
  } catch { }
  return [{ name: 'Storage', total: 0, used: 0, type: 'Unavailable' }];
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
    const dlBits = blob.size * 8;
    results.download = Math.round((dlBits / dlTime / 1_000_000) * 10) / 10;

    const uploadData = new Uint8Array(100000);
    const ulStart = performance.now();
    try {
      await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: uploadData,
        mode: 'no-cors',
        cache: 'no-store',
      });
    } catch { }
    const ulTime = (performance.now() - ulStart) / 1000;
    const ulBits = uploadData.byteLength * 8;
    results.upload = Math.round((ulBits / ulTime / 1_000_000) * 10) / 10;
  } catch { }

  return results;
}

function getMemoryInfo(): { used: number; total: number } {
  const perf = (performance as any);
  if (perf.memory) {
    return {
      used: Math.round((perf.memory.usedJSHeapSize / (1024 ** 3)) * 100) / 100,
      total: Math.round((perf.memory.jsHeapSizeLimit / (1024 ** 3)) * 100) / 100,
    };
  }
  const devMem = (navigator as any).deviceMemory;
  if (devMem) {
    return { used: 0, total: devMem };
  }
  return { used: 0, total: 0 };
}

export function useRealSystemData() {
  const [data, setData] = useState<RealSystemData>(() => {
    const gpu = getGPUInfo();
    const mem = getMemoryInfo();
    const cores = navigator.hardwareConcurrency || 0;
    return {
      cpu: { name: `${cores}-Core Processor`, cores, threads: cores, usage: 0 },
      ram: { used: mem.used, total: mem.total, percent: mem.total > 0 ? (mem.used / mem.total) * 100 : 0 },
      gpu: { name: gpu.name, vendor: gpu.vendor },
      storage: [],
      network: { download: 0, upload: 0, ping: 0, type: (navigator as any).connection?.effectiveType || 'unknown', testing: false },
      processes: [],
      uptime: formatUptime(),
      platform: getPlatformInfo(),
    };
  });

  const [speedTested, setSpeedTested] = useState(false);

  useEffect(() => {
    getStorageInfo().then((storage) => {
      setData((prev) => ({ ...prev, storage }));
    });
  }, []);

  const runSpeedTest = useCallback(async () => {
    setData((prev) => ({ ...prev, network: { ...prev.network, testing: true } }));
    const results = await measureNetworkSpeed();
    const connType = (navigator as any).connection?.effectiveType || 'unknown';
    setData((prev) => ({
      ...prev,
      network: { ...results, type: connType, testing: false },
    }));
    setSpeedTested(true);
  }, []);

  useEffect(() => {
    if (!speedTested) {
      runSpeedTest();
    }
  }, [speedTested, runSpeedTest]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mem = getMemoryInfo();
      setData((prev) => ({
        ...prev,
        ram: { used: mem.used, total: mem.total, percent: mem.total > 0 ? (mem.used / mem.total) * 100 : 0 },
        uptime: formatUptime(),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const entries = performance.getEntriesByType('resource').slice(-20);
      const grouped: Record<string, { count: number; totalSize: number }> = {};
      entries.forEach((e: any) => {
        const url = new URL(e.name, location.origin);
        const host = url.hostname || 'local';
        if (!grouped[host]) grouped[host] = { count: 0, totalSize: 0 };
        grouped[host].count++;
        grouped[host].totalSize += e.transferSize || 0;
      });
      const processes = Object.entries(grouped)
        .map(([name, info]) => ({
          name,
          cpu: info.count,
          ram: Math.round((info.totalSize / 1024) * 10) / 10,
        }))
        .sort((a, b) => b.ram - a.ram)
        .slice(0, 5);
      setData((prev) => ({ ...prev, processes }));
    } catch { }
  }, []);

  return { data, runSpeedTest };
}
