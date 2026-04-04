import { useJarvisStore } from '@/store/jarvisStore';
import { Minus, Plus, Play } from 'lucide-react';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useState } from 'react';

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-display text-[9px] tracking-[0.2em] text-muted-foreground/25 uppercase mb-3">{children}</p>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 border-b border-[hsl(222,15%,10%)] last:border-0">
    <div className="mr-3">
      <p className="text-[11px] text-foreground/70">{label}</p>
      {desc && <p className="text-[9px] text-muted-foreground/25 font-mono mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-8 h-[18px] rounded-full transition-all relative ${
      checked ? 'bg-primary/80' : 'bg-[hsl(222,15%,14%)]'
    }`}
  >
    <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all ${
      checked ? 'left-[14px] bg-primary-foreground' : 'left-[2px] bg-muted-foreground/40'
    }`} />
  </button>
);

const Input = ({ className = 'w-32', ...props }: any) => (
  <input
    className={`${className} bg-[hsl(222,20%,9%)] text-[10px] text-foreground/70 px-2.5 py-1.5 rounded-md border border-[hsl(222,15%,12%)] font-mono text-right outline-none focus:border-primary/30 transition-colors`}
    {...props}
  />
);

const clipDurations = [15, 30, 45, 60, 90, 120];

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const adjustClip = (dir: 'up' | 'down') => {
    const i = clipDurations.indexOf(settings.clipDuration);
    if (dir === 'up' && i < clipDurations.length - 1) updateSettings({ clipDuration: clipDurations[i + 1] });
    else if (dir === 'down' && i > 0) updateSettings({ clipDuration: clipDurations[i - 1] });
    else if (i === -1) updateSettings({ clipDuration: 30 });
  };

  const handlePreview = async (id: string, elId: string) => {
    setPreviewing(id);
    await previewVoice(elId);
    setPreviewing(null);
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto grid-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,hsl(222,28%,5%)_100%)] pointer-events-none" />
      <div className="relative">
        <h2 className="font-display text-xs text-primary/80 tracking-[0.2em] mb-5">SETTINGS</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="surface rounded-lg p-4">
              <Label>General</Label>
              <Row label="Wake Word" desc="Activation name">
                <Input value={settings.wakeName} onChange={(e: any) => updateSettings({ wakeName: e.target.value })} className="w-24" />
              </Row>
              <Row label="Start on Boot" desc="Auto-launch with Windows">
                <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
              </Row>
            </div>

            <div className="surface rounded-lg p-4">
              <Label>Voice & Input</Label>
              <Row label="Always Listening" desc="Keep mic active">
                <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
              </Row>
              <Row label="Push to Talk" desc="Hold hotkey to speak">
                <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
              </Row>
            </div>

            <div className="surface rounded-lg p-4">
              <Label>Clipping</Label>
              <Row label="Duration" desc="Replay buffer length">
                <div className="flex items-center gap-0.5">
                  <button onClick={() => adjustClip('down')} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-[hsl(222,20%,12%)] transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-[10px] font-mono text-foreground/60 bg-[hsl(222,20%,9%)] rounded py-1 border border-[hsl(222,15%,12%)]">
                    {settings.clipDuration}s
                  </span>
                  <button onClick={() => adjustClip('up')} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-[hsl(222,20%,12%)] transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </Row>
              <Row label="Save Folder">
                <Input value={settings.clipFolder} onChange={(e: any) => updateSettings({ clipFolder: e.target.value })} className="w-44" />
              </Row>
            </div>

            <div className="surface rounded-lg p-4">
              <Label>OBS Connection</Label>
              <Row label="WebSocket URL">
                <Input value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-36" />
              </Row>
              <Row label="Password">
                <Input type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-36" placeholder="••••••" />
              </Row>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <div className="surface rounded-lg p-4">
              <Label>Voice</Label>
              <div className="space-y-0.5">
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => updateSettings({ voice: v.id, voiceId: v.elevenLabsId })}
                    className={`w-full flex items-center gap-2 p-2 rounded-md transition-all text-left ${
                      settings.voice === v.id
                        ? 'bg-primary/8 border border-primary/15'
                        : 'hover:bg-[hsl(222,20%,10%)] border border-transparent'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                      settings.voice === v.id ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.4)]' : 'bg-muted-foreground/15'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground/70">{v.label}</p>
                      <p className="text-[8px] text-muted-foreground/25 font-mono truncate">{v.description}</p>
                    </div>
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center text-primary/25 hover:text-primary/60 hover:bg-primary/8 transition-colors shrink-0"
                      onClick={(e) => { e.stopPropagation(); handlePreview(v.id, v.elevenLabsId); }}
                      disabled={previewing !== null}
                    >
                      {previewing === v.id ? (
                        <div className="w-2.5 h-2.5 border border-primary/50 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface rounded-lg p-4">
              <Label>Hotkeys</Label>
              {[
                { label: 'Clip Last 30s', key: 'Ctrl+Shift+C' },
                { label: 'Toggle Recording', key: 'Ctrl+Shift+R' },
                { label: 'Toggle Mic', key: 'Ctrl+Shift+M' },
                { label: 'Push to Talk', key: 'Ctrl+Space' },
                { label: 'Show/Hide', key: 'Ctrl+Shift+J' },
              ].map(({ label, key }) => (
                <Row key={label} label={label}>
                  <kbd className="text-[9px] font-mono px-2 py-0.5 bg-[hsl(222,20%,9%)] rounded border border-[hsl(222,15%,12%)] text-muted-foreground/30">{key}</kbd>
                </Row>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
