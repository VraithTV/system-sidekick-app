import { Clock, Play, Pause, Repeat, Zap, Eye } from 'lucide-react';

const mockRoutines = [
  {
    id: '1',
    name: 'Gaming Mode',
    trigger: '"Hey Jarvis, gaming mode"',
    actions: ['Open Discord', 'Open Steam', 'Set audio to headset', 'Launch OBS'],
    enabled: true,
  },
  {
    id: '2',
    name: 'Work Mode',
    trigger: '"Hey Jarvis, work mode"',
    actions: ['Open VS Code', 'Open Chrome', 'Open Slack', 'Mute Discord'],
    enabled: true,
  },
  {
    id: '3',
    name: 'Stream Setup',
    trigger: '"Hey Jarvis, start stream"',
    actions: ['Open OBS', 'Start streaming', 'Open chat overlay', 'Set scene to Main'],
    enabled: false,
  },
  {
    id: '4',
    name: 'Goodnight',
    trigger: '"Hey Jarvis, goodnight"',
    actions: ['Close all apps', 'Set volume to 0', 'Enable Do Not Disturb'],
    enabled: true,
  },
];

export const RoutinesView = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">ROUTINES</h2>
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

        {/* Mock Routines */}
        <div className="space-y-3">
          {mockRoutines.map((routine) => (
            <div
              key={routine.id}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    routine.enabled ? 'bg-primary/10' : 'bg-muted/30'
                  }`}>
                    <Repeat className={`w-5 h-5 ${routine.enabled ? 'text-primary' : 'text-muted-foreground/40'}`} />
                  </div>
                  <div>
                    <p className="text-[13px] text-foreground/85 font-medium">{routine.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{routine.trigger}</p>
                  </div>
                </div>
                <div className={`w-10 h-[22px] rounded-full transition-all relative ${
                  routine.enabled ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all shadow-sm ${
                    routine.enabled ? 'left-[20px] bg-primary-foreground' : 'left-[3px] bg-muted-foreground/50'
                  }`} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-[52px]">
                {routine.actions.map((action, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-[10px] font-mono bg-muted/50 px-2.5 py-1 rounded-lg border border-border text-foreground/50"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
