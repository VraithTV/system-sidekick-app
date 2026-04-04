import { useJarvisStore } from '@/store/jarvisStore';
import { Cpu, MemoryStick, MonitorCog } from 'lucide-react';

const StatBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => {
  const color = value > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          <span className="font-mono">{label}</span>
        </div>
        <span className="font-mono font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.max(value, 2)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const StatusDot = ({ active, label, activeLabel, inactiveLabel, color = 'success' }: any) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2.5">
      <span className={`text-[10px] font-mono ${active ? `text-${color}` : 'text-muted-foreground/40'}`}>
        {active ? activeLabel : inactiveLabel}
      </span>
      <div className={`w-2 h-2 rounded-full ${
        active ? `bg-${color} shadow-[0_0_8px_hsl(var(--${color})/0.5)]` : 'bg-muted-foreground/20'
      }`} />
    </div>
  </div>
);

export const StatusPanel = () => {
  const { systemStatus } = useJarvisStore();

  return (
    <div className="space-y-6">
      <p className="font-display text-[10px] tracking-[0.2em] text-foreground/50 uppercase">System</p>

      <div className="space-y-5">
        <StatBar label="CPU" value={systemStatus.cpu} icon={Cpu} />
        <StatBar label="RAM" value={systemStatus.ram} icon={MemoryStick} />
        <StatBar label="GPU" value={systemStatus.gpu} icon={MonitorCog} />
      </div>

      <div className="h-px bg-border" />

      <div>
        <StatusDot active={systemStatus.micActive} label="Microphone" activeLabel="Active" inactiveLabel="Off" />
        <StatusDot active={systemStatus.obsConnected} label="OBS" activeLabel="Connected" inactiveLabel="—" />
        <StatusDot active={systemStatus.isRecording} label="Recording" activeLabel="REC" inactiveLabel="—" color="destructive" />
        <StatusDot active={systemStatus.isStreaming} label="Stream" activeLabel="LIVE" inactiveLabel="—" />
      </div>
    </div>
  );
};
