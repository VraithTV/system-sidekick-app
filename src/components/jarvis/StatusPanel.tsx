import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff, Wifi, WifiOff, Circle, Monitor, Cpu, MemoryStick, MonitorCog } from 'lucide-react';

const StatBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => {
  const color = value > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <Icon className="w-3 h-3" />
          <span className="font-mono">{label}</span>
        </div>
        <span className="font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-[3px] bg-[hsl(222,15%,12%)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const StatusDot = ({ active, label, activeLabel, inactiveLabel, color = 'success' }: any) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[10px] font-mono text-muted-foreground/40">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-mono ${active ? `text-${color}` : 'text-muted-foreground/25'}`}>
        {active ? activeLabel : inactiveLabel}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full ${
        active ? `bg-${color} shadow-[0_0_6px_hsl(var(--${color})/0.5)]` : 'bg-muted-foreground/15'
      }`} />
    </div>
  </div>
);

export const StatusPanel = () => {
  const { systemStatus } = useJarvisStore();

  return (
    <div className="space-y-5">
      <p className="font-display text-[9px] tracking-[0.25em] text-muted-foreground/30 uppercase">System</p>

      <div className="space-y-3">
        <StatBar label="CPU" value={systemStatus.cpu} icon={Cpu} />
        <StatBar label="RAM" value={systemStatus.ram} icon={MemoryStick} />
        <StatBar label="GPU" value={systemStatus.gpu} icon={MonitorCog} />
      </div>

      <div className="h-px bg-[hsl(222,15%,10%)]" />

      <div>
        <StatusDot active={systemStatus.micActive} label="Mic" activeLabel="On" inactiveLabel="Off" />
        <StatusDot active={systemStatus.obsConnected} label="OBS" activeLabel="OK" inactiveLabel="—" />
        <StatusDot active={systemStatus.isRecording} label="Rec" activeLabel="REC" inactiveLabel="—" color="destructive" />
        <StatusDot active={systemStatus.isStreaming} label="Live" activeLabel="LIVE" inactiveLabel="—" />
      </div>
    </div>
  );
};
