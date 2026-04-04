import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff, Wifi, WifiOff, Circle, Monitor } from 'lucide-react';

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px]">
      <span className="text-muted-foreground font-mono">{label}</span>
      <span className={`font-mono ${color}`}>{value}%</span>
    </div>
    <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatusRow = ({ icon: Icon, label, active, activeText, inactiveText, activeColor = 'text-success' }: any) => (
  <div className="flex items-center justify-between text-[10px] py-1.5">
    <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
      <Icon className={`w-3 h-3 ${active ? activeColor : 'text-muted-foreground/40'}`} />
      {label}
    </div>
    <span className={`font-mono ${active ? activeColor : 'text-muted-foreground/40'}`}>
      {active ? activeText : inactiveText}
    </span>
  </div>
);

export const StatusPanel = () => {
  const { systemStatus } = useJarvisStore();

  return (
    <div className="space-y-4">
      <h3 className="font-display text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">System</h3>

      <div className="space-y-2.5">
        <StatBar label="CPU" value={systemStatus.cpu} color={systemStatus.cpu > 80 ? 'text-destructive' : 'text-primary'} />
        <StatBar label="RAM" value={systemStatus.ram} color={systemStatus.ram > 85 ? 'text-destructive' : 'text-primary'} />
        <StatBar label="GPU" value={systemStatus.gpu} color={systemStatus.gpu > 90 ? 'text-destructive' : 'text-primary'} />
      </div>

      <div className="border-t border-border/30 pt-3 space-y-0.5">
        <StatusRow icon={systemStatus.micActive ? Mic : MicOff} label="Mic" active={systemStatus.micActive} activeText="On" inactiveText="Off" />
        <StatusRow icon={systemStatus.obsConnected ? Wifi : WifiOff} label="OBS" active={systemStatus.obsConnected} activeText="OK" inactiveText="Off" />
        <StatusRow icon={Circle} label="Rec" active={systemStatus.isRecording} activeText="REC" inactiveText="Off" activeColor="text-destructive" />
        <StatusRow icon={Monitor} label="Live" active={systemStatus.isStreaming} activeText="LIVE" inactiveText="Off" />
      </div>
    </div>
  );
};
