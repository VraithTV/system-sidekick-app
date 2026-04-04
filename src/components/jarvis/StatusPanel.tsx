import { useJarvisStore } from '@/store/jarvisStore';
import { Mic, MicOff, Monitor, Wifi, WifiOff, Circle } from 'lucide-react';

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground font-mono">{label}</span>
      <span className={`font-mono ${color}`}>{value}%</span>
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const StatusPanel = () => {
  const { systemStatus } = useJarvisStore();

  return (
    <div className="glass rounded-lg p-4 space-y-4">
      <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">System Status</h3>
      
      <div className="space-y-3">
        <StatBar label="CPU" value={systemStatus.cpu} color={systemStatus.cpu > 80 ? 'text-destructive' : 'text-primary'} />
        <StatBar label="RAM" value={systemStatus.ram} color={systemStatus.ram > 85 ? 'text-destructive' : 'text-primary'} />
        <StatBar label="GPU" value={systemStatus.gpu} color={systemStatus.gpu > 90 ? 'text-destructive' : 'text-primary'} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            {systemStatus.micActive ? <Mic className="w-3 h-3 text-success" /> : <MicOff className="w-3 h-3 text-destructive" />}
            Microphone
          </div>
          <span className={systemStatus.micActive ? 'text-success' : 'text-destructive'}>{systemStatus.micActive ? 'Active' : 'Muted'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            {systemStatus.obsConnected ? <Wifi className="w-3 h-3 text-success" /> : <WifiOff className="w-3 h-3 text-destructive" />}
            OBS WebSocket
          </div>
          <span className={systemStatus.obsConnected ? 'text-success' : 'text-destructive'}>{systemStatus.obsConnected ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <Circle className={`w-3 h-3 ${systemStatus.isRecording ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} />
            Recording
          </div>
          <span className={systemStatus.isRecording ? 'text-destructive' : 'text-muted-foreground'}>{systemStatus.isRecording ? 'REC' : 'Off'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <Monitor className={`w-3 h-3 ${systemStatus.isStreaming ? 'text-success' : 'text-muted-foreground'}`} />
            Streaming
          </div>
          <span className={systemStatus.isStreaming ? 'text-success' : 'text-muted-foreground'}>{systemStatus.isStreaming ? 'LIVE' : 'Off'}</span>
        </div>
      </div>
    </div>
  );
};
