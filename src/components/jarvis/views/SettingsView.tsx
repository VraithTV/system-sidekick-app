import { useJarvisStore } from '@/store/jarvisStore';
import { Minus, Plus, Play } from 'lucide-react';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useState } from 'react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-display text-[10px] tracking-[0.2em] text-primary/50 uppercase mb-4">{children}</p>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <div className="mr-4">
      <p className="text-[12px] text-foreground/80">{label}</p>
      {desc && <p className="text-[10px] text-muted-foreground/30 font-mono mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-9 h-5 rounded-full transition-all relative ${
      checked ? 'bg-primary' : 'bg-secondary'
    }`}
  >
    <div className={`absolute top-[3px] w-[14px] h-[14px] rounded-full transition-all shadow-sm ${
      checked ? 'left-[17px] bg-primary-foreground' : 'left-[3px] bg-muted-foreground/40'
    }`} />
  </button>
);

const Input = ({ className = 'w-36', ...props }: any) => (
  <input
    className={`${className} bg-secondary text-[11px] text-foreground/70 px-3 py-2 rounded-md border border-border font-mono text-right outline-none focus:border-primary/40 transition-colors`}
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
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="font-display text-sm text-primary/80 tracking-[0.15em] mb-6">SETTINGS</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>General</SectionTitle>
              <Row label="Wake Word" desc="Activation trigger name">
                <Input value={settings.wakeName} onChange={(e: any) => updateSettings({ wakeName: e.target.value })} className="w-28" />
              </Row>
              <Row label="Start on Boot" desc="Auto-launch with Windows">
                <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>Voice Input</SectionTitle>
              <Row label="Always Listening" desc="Keep mic active in background">
                <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
              </Row>
              <Row label="Push to Talk" desc="Hold hotkey to speak">
                <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>Clip Settings</SectionTitle>
              <Row label="Buffer Duration" desc="Replay buffer length">
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustClip('down')} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-secondary transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-[11px] font-mono text-foreground/60 bg-secondary rounded-md py-1.5 border border-border">
                    {settings.clipDuration}s
                  </span>
                  <button onClick={() => adjustClip('up')} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-secondary transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Row>
              <Row label="Save Folder">
                <Input value={settings.clipFolder} onChange={(e: any) => updateSettings({ clipFolder: e.target.value })} className="w-48" />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>OBS Connection</SectionTitle>
              <Row label="WebSocket URL">
                <Input value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-40" />
              </Row>
              <Row label="Password">
                <Input type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-40" placeholder="••••••" />
              </Row>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>Voice Selection</SectionTitle>
              <div className="space-y-1">
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => updateSettings({ voice: v.id, voiceId: v.elevenLabsId })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      settings.voice === v.id
                        ? 'bg-primary/8 border border-primary/20'
                        : 'hover:bg-secondary border border-transparent'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      settings.voice === v.id ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/15'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground/80">{v.label}</p>
                      <p className="text-[10px] text-muted-foreground/30 font-mono truncate">{v.description}</p>
                    </div>
                    <button
                      className="w-7 h-7 rounded-md flex items-center justify-center text-primary/30 hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                      onClick={(e) => { e.stopPropagation(); handlePreview(v.id, v.elevenLabsId); }}
                      disabled={previewing !== null}
                    >
                      {previewing === v.id ? (
                        <div className="w-3 h-3 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border">
              <SectionTitle>Keyboard Shortcuts</SectionTitle>
              {[
                { label: 'Clip Last 30s', key: 'Ctrl+Shift+C' },
                { label: 'Toggle Recording', key: 'Ctrl+Shift+R' },
                { label: 'Toggle Mic', key: 'Ctrl+Shift+M' },
                { label: 'Push to Talk', key: 'Ctrl+Space' },
                { label: 'Show / Hide', key: 'Ctrl+Shift+J' },
              ].map(({ label, key }) => (
                <Row key={label} label={label}>
                  <kbd className="text-[10px] font-mono px-2.5 py-1 bg-secondary rounded-md border border-border text-muted-foreground/40">{key}</kbd>
                </Row>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
