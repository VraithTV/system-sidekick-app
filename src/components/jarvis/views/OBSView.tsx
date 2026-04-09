import { useJarvisStore } from '@/store/jarvisStore';
import { Monitor, Circle, Radio, Camera, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { requestVoiceAssistantStart, requestVoiceAssistantStop } from '@/hooks/useVoiceAssistant';
import { Button } from '@/components/ui/button';

export const OBSView = () => {
  const { systemStatus, setSystemStatus } = useJarvisStore();

  const toggleMic = () => {
    if (systemStatus.micActive) {
      requestVoiceAssistantStop();
    } else {
      requestVoiceAssistantStart();
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="font-display text-lg text-primary glow-text tracking-wider">OBS CONTROL</h2>
        <p className="text-xs text-muted-foreground font-mono mt-1">Manage OBS Studio remotely</p>
      </div>

      {/* Connection status */}
      <div className="glass rounded-lg p-4 flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${systemStatus.obsConnected ? 'bg-success' : 'bg-destructive'}`} />
        <div>
          <p className="text-sm font-medium text-foreground">{systemStatus.obsConnected ? 'Connected to OBS WebSocket' : 'OBS Not Connected'}</p>
          <p className="text-[10px] text-muted-foreground font-mono">ws://localhost:4455</p>
        </div>
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant={systemStatus.isRecording ? 'destructive' : 'jarvis'}
          className="h-24 flex-col gap-2"
          onClick={() => setSystemStatus({ isRecording: !systemStatus.isRecording })}
        >
          <Circle className={`w-6 h-6 ${systemStatus.isRecording ? 'fill-current' : ''}`} />
          <span className="text-xs">{systemStatus.isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </Button>

        <Button
          variant={systemStatus.isStreaming ? 'destructive' : 'jarvis'}
          className="h-24 flex-col gap-2"
          onClick={() => setSystemStatus({ isStreaming: !systemStatus.isStreaming })}
        >
          <Radio className={`w-6 h-6 ${systemStatus.isStreaming ? 'animate-pulse' : ''}`} />
          <span className="text-xs">{systemStatus.isStreaming ? 'Stop Streaming' : 'Start Streaming'}</span>
        </Button>

        <Button variant="jarvis" className="h-24 flex-col gap-2">
          <Camera className="w-6 h-6" />
          <span className="text-xs">Screenshot</span>
        </Button>

        <Button variant="jarvis" className="h-24 flex-col gap-2">
          <Monitor className="w-6 h-6" />
          <span className="text-xs">Switch Scene</span>
        </Button>
      </div>

      {/* Audio controls */}
      <div className="glass rounded-lg p-4 space-y-3">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">Audio Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="jarvis"
            className="justify-start gap-3"
            onClick={toggleMic}
          >
            {systemStatus.micActive ? <Mic className="w-4 h-4 text-success" /> : <MicOff className="w-4 h-4 text-destructive" />}
            <span className="text-xs">{systemStatus.micActive ? 'Mute Mic' : 'Unmute Mic'}</span>
          </Button>
          <Button variant="jarvis" className="justify-start gap-3">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs">Desktop Audio</span>
          </Button>
        </div>
      </div>

      {/* Scenes */}
      <div className="glass rounded-lg p-4 space-y-3">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">Scenes</h3>
        <div className="grid grid-cols-3 gap-2">
          {['Gameplay', 'Webcam', 'Starting Soon', 'BRB', 'Ending'].map((scene, i) => (
            <Button key={scene} variant={i === 0 ? 'default' : 'jarvis'} size="sm" className="text-xs">
              {scene}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
