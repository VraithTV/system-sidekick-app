import { forwardRef } from 'react';
import { Cpu, MemoryStick, HardDrive, Monitor, Wifi, Activity, RefreshCw, Info } from 'lucide-react';
import { useRealSystemData } from '@/hooks/useRealSystemData';
import { useJarvisStore } from '@/store/jarvisStore';
import { createT } from '@/lib/i18n';

const ProgressBar = forwardRef<HTMLDivElement, { value: number; max?: number; color?: string }>(
  function ProgressBar({ value, max = 100, color = 'bg-primary' }, ref) {
    return (
      <div ref={ref} className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    );
  }
);

const getUsageColor = (percent: number) => {
  if (percent > 80) return 'bg-destructive';
  if (percent > 60) return 'bg-amber-500';
  return 'bg-primary';
};

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const SystemView = () => {
  const { data: sys, runSpeedTest } = useRealSystemData();
  const { settings } = useJarvisStore();
  const t = createT(settings.language || 'en');

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">{t('nav.system').toUpperCase()}</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground/60">{sys.platform}</span>
            <span className="text-[10px] font-mono text-muted-foreground/40">{t('sys.session')}: {sys.uptime}</span>
          </div>
        </div>

        {!isElectron && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground font-mono">
              {t('sys.browserNote')}
            </p>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* CPU */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.cpu')}</p>
            </div>
            <p className="text-[12px] text-foreground/70 truncate mb-3">{sys.cpu.name}</p>
            <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
              <span>{sys.cpu.cores} {t('sys.cores')}</span>
            </div>
          </div>

          {/* RAM */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <MemoryStick className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.memory')}</p>
            </div>
            {sys.ram.total > 0 ? (
              <>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-display text-foreground/90">{sys.ram.used.toFixed(2)}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">/ {sys.ram.total.toFixed(1)} GB</span>
                </div>
                <ProgressBar value={sys.ram.percent} color={getUsageColor(sys.ram.percent)} />
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
                  {(sys.ram.total - sys.ram.used).toFixed(2)} GB {t('sys.available')}
                </p>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 font-mono">{t('sys.ramDesktop')}</p>
            )}
          </div>

          {/* GPU */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.gpu')}</p>
            </div>
            <p className="text-[12px] text-foreground/70 truncate mb-2">{sys.gpu.name}</p>
            {sys.gpu.vendor && <p className="text-[10px] text-muted-foreground/50 font-mono">{sys.gpu.vendor}</p>}
          </div>

          {/* Network Activity */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.networkActivity')}</p>
            </div>
            {sys.processes.length > 0 ? (
              <div className="space-y-2.5">
                {sys.processes.map((proc) => (
                  <div key={proc.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground/70 font-mono truncate max-w-[160px]">{proc.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground font-mono">{proc.cpu} <span className="text-muted-foreground/50">reqs</span></span>
                      <span className="text-muted-foreground font-mono">{proc.ram} <span className="text-muted-foreground/50">KB</span></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 font-mono">{t('sys.noActivity')}</p>
            )}
          </div>
        </div>

        {/* Drives & Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Storage */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.storage')}</p>
            </div>
            <div className="space-y-4">
              {sys.storage.length > 0 ? sys.storage.map((drive) => {
                const percent = drive.total > 0 ? (drive.used / drive.total) * 100 : 0;
                return (
                  <div key={drive.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground/70 font-medium">
                        {drive.name} <span className="text-muted-foreground/50 font-mono text-[10px]">{drive.type}</span>
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {drive.used.toFixed(2)} / {drive.total.toFixed(1)} GB
                      </span>
                    </div>
                    <ProgressBar value={percent} color={getUsageColor(percent)} />
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">
                      {(drive.total - drive.used).toFixed(2)} GB {t('sys.free')}
                    </p>
                  </div>
                );
              }) : (
                <p className="text-[11px] text-muted-foreground/50 font-mono">{t('sys.storageDesktop')}</p>
              )}
            </div>
          </div>

          {/* Network */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-mono tracking-[0.15em] text-primary/60 uppercase">{t('sys.network')}</p>
              </div>
              <button
                onClick={runSpeedTest}
                disabled={sys.network.testing}
                className="flex items-center gap-1 text-[10px] font-mono text-primary/50 hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${sys.network.testing ? 'animate-spin' : ''}`} />
                {sys.network.testing ? t('sys.testing') : t('sys.retest')}
              </button>
            </div>
            {sys.network.testing ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-muted-foreground ml-3">{t('sys.runningTest')}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{t('sys.download')}</p>
                    <p className="text-lg font-display text-foreground/90">
                      {sys.network.download > 0 ? sys.network.download.toFixed(1) : '--'}
                      <span className="text-[10px] text-muted-foreground font-mono ml-1">Mbps</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">{t('sys.upload')}</p>
                    <p className="text-lg font-display text-foreground/90">
                      {sys.network.upload > 0 ? sys.network.upload.toFixed(1) : '--'}
                      <span className="text-[10px] text-muted-foreground font-mono ml-1">Mbps</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">{t('sys.ping')}</span>
                  <span className="text-foreground/80 font-mono">{sys.network.ping > 0 ? `${sys.network.ping} ms` : '--'}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/40 font-mono">
                  <span>{t('sys.connection')}: {sys.network.type}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
