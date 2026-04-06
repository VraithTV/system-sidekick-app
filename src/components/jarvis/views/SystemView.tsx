import { useState, useEffect } from 'react';
import { Cpu, MemoryStick, HardDrive, Thermometer, Monitor, Wifi, Keyboard, Activity } from 'lucide-react';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

// Simulated system data for preview
const useMockSystemData = () => {
  const [data, setData] = useState({
    cpu: { usage: 23, temp: 52, name: 'AMD Ryzen 7 5800X', cores: 8, threads: 16 },
    ram: { used: 12.4, total: 32, percent: 38.8 },
    gpu: { usage: 15, temp: 45, name: 'NVIDIA RTX 3070', vram: '8 GB' },
    drives: [
      { name: 'C:', total: 500, used: 312, type: 'NVMe SSD' },
      { name: 'D:', total: 2000, used: 1240, type: 'HDD' },
      { name: 'E:', total: 1000, used: 430, type: 'SSD' },
    ],
    network: { download: 45.2, upload: 12.8, ping: 18 },
    uptime: '3d 14h 22m',
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        cpu: { ...prev.cpu, usage: Math.min(100, Math.max(5, prev.cpu.usage + (Math.random() - 0.5) * 8)), temp: Math.min(85, Math.max(35, prev.cpu.temp + (Math.random() - 0.5) * 3)) },
        ram: { ...prev.ram, used: Math.min(prev.ram.total, Math.max(4, prev.ram.used + (Math.random() - 0.5) * 0.5)), percent: 0 },
        gpu: { ...prev.gpu, usage: Math.min(100, Math.max(0, prev.gpu.usage + (Math.random() - 0.5) * 10)), temp: Math.min(80, Math.max(30, prev.gpu.temp + (Math.random() - 0.5) * 2)) },
        network: { download: Math.max(0, prev.network.download + (Math.random() - 0.5) * 10), upload: Math.max(0, prev.network.upload + (Math.random() - 0.5) * 5), ping: Math.max(5, prev.network.ping + (Math.random() - 0.5) * 4) },
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate RAM percent
  data.ram.percent = (data.ram.used / data.ram.total) * 100;

  return data;
};

const ProgressBar = ({ value, max = 100, color = 'bg-primary' }: { value: number; max?: number; color?: string }) => (
  <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

const getUsageColor = (percent: number) => {
  if (percent > 80) return 'bg-destructive';
  if (percent > 60) return 'bg-amber-500';
  return 'bg-primary';
};

export const SystemView = () => {
  const sys = useMockSystemData();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">SYSTEM</h2>
          <span className="text-[10px] font-mono text-muted-foreground/60">Uptime: {sys.uptime}</span>
        </div>


        {/* Shortcuts */}
        <div className="bg-card/50 rounded-xl p-4 border border-border/50 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4 text-primary/60" />
            <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">Keyboard Shortcuts</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { keys: 'Ctrl+Shift+J', label: 'Show / Hide Jarvis' },
              { keys: 'Ctrl+Shift+M', label: 'Toggle mic' },
              { keys: 'Ctrl+Space', label: 'Push to talk' },
              { keys: 'Ctrl+Shift+R', label: 'Toggle recording' },
              { keys: 'Ctrl+Shift+C', label: 'Clip last 30s' },
            ].map(({ keys, label }) => (
              <div key={keys} className="flex items-center gap-2">
                <kbd className="text-[10px] font-mono px-2 py-1 bg-muted rounded border border-border text-muted-foreground">
                  {keys}
                </kbd>
                <span className="text-[11px] text-foreground/50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {/* CPU */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">CPU</p>
            </div>
            <p className="text-[12px] text-foreground/70 truncate mb-3">{sys.cpu.name}</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="text-foreground/80 font-mono">{Math.round(sys.cpu.usage)}%</span>
                </div>
                <ProgressBar value={sys.cpu.usage} color={getUsageColor(sys.cpu.usage)} />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Temp
                </span>
                <span className="text-foreground/80 font-mono">{Math.round(sys.cpu.temp)}°C</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span>{sys.cpu.cores} cores / {sys.cpu.threads} threads</span>
              </div>
            </div>
          </div>

          {/* RAM */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <MemoryStick className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">Memory</p>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-display text-foreground/90">{sys.ram.used.toFixed(1)}</span>
              <span className="text-[11px] text-muted-foreground font-mono">/ {sys.ram.total} GB</span>
            </div>
            <ProgressBar value={sys.ram.percent} color={getUsageColor(sys.ram.percent)} />
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
              {(sys.ram.total - sys.ram.used).toFixed(1)} GB available
            </p>
          </div>

          {/* GPU */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">GPU</p>
            </div>
            <p className="text-[12px] text-foreground/70 truncate mb-3">{sys.gpu.name}</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="text-foreground/80 font-mono">{Math.round(sys.gpu.usage)}%</span>
                </div>
                <ProgressBar value={sys.gpu.usage} color={getUsageColor(sys.gpu.usage)} />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Temp
                </span>
                <span className="text-foreground/80 font-mono">{Math.round(sys.gpu.temp)}°C</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span>VRAM: {sys.gpu.vram}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drives & Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Drives */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">Storage Drives</p>
            </div>
            <div className="space-y-4">
              {sys.drives.map((drive) => {
                const percent = (drive.used / drive.total) * 100;
                return (
                  <div key={drive.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground/70 font-medium">
                        {drive.name} <span className="text-muted-foreground/50 font-mono text-[10px]">{drive.type}</span>
                      </span>
                      <span className="text-muted-foreground font-mono">{drive.used} / {drive.total} GB</span>
                    </div>
                    <ProgressBar value={percent} color={getUsageColor(percent)} />
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">
                      {drive.total - drive.used} GB free
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">Network</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-muted-foreground">Download</p>
                  <p className="text-lg font-display text-foreground/90">{sys.network.download.toFixed(1)} <span className="text-[10px] text-muted-foreground font-mono">Mbps</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Upload</p>
                  <p className="text-lg font-display text-foreground/90">{sys.network.upload.toFixed(1)} <span className="text-[10px] text-muted-foreground font-mono">Mbps</span></p>
                </div>
              </div>
              <div className="flex justify-between text-[11px] pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Ping</span>
                <span className="text-foreground/80 font-mono">{Math.round(sys.network.ping)} ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
