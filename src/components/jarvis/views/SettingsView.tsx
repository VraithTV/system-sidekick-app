import { useJarvisStore } from '@/store/jarvisStore';
import { Minus, Plus, Play, X, RefreshCw } from 'lucide-react';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useState } from 'react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-display text-[10px] tracking-[0.2em] text-primary/60 uppercase mb-4">{children}</p>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
    <div className="mr-4">
      <p className="text-[13px] text-foreground/85">{label}</p>
      {desc && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-10 h-[22px] rounded-full transition-all relative ${
      checked ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all shadow-sm ${
      checked ? 'left-[20px] bg-primary-foreground' : 'left-[3px] bg-muted-foreground/50'
    }`} />
  </button>
);

const Input = ({ className = 'w-36', ...props }: any) => (
  <input
    className={`${className} bg-muted text-[12px] text-foreground/80 px-3 py-2 rounded-lg border border-border font-mono text-right outline-none focus:border-primary/50 transition-colors`}
    {...props}
  />
);

const clipDurations = [15, 30, 45, 60, 90, 120];

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant();
  const { inputs, outputs, refresh: refreshDevices } = useAudioDevices();
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
      <div className="p-8">
        <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">SETTINGS</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>General</SectionTitle>
              <Row label="Wake Word" desc="Activation trigger name">
                <Input value={settings.wakeName} onChange={(e: any) => updateSettings({ wakeName: e.target.value })} className="w-28" />
              </Row>

              {/* Wake word aliases */}
              <div className="py-3 border-b border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/85">Wake Aliases</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Alt spellings the speech API may hear</p>
                  </div>
                  <button
                    onClick={() => {
                      const alias = prompt('Add alias (how the speech API hears your wake word):');
                      if (alias?.trim()) updateSettings({ wakeAliases: [...settings.wakeAliases, alias.trim()] });
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {settings.wakeAliases.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/50 font-mono">None yet — add if wake word isn't detected</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {settings.wakeAliases.map((alias, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] font-mono bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground/70">
                      {alias}
                      <button
                        onClick={() => updateSettings({ wakeAliases: settings.wakeAliases.filter((_, j) => j !== i) })}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sensitivity slider */}
              <Row label="Wake Sensitivity" desc={`${Math.round(settings.wakeSensitivity * 100)}% — lower = more lenient`}>
                <input
                  type="range"
                  min={0.3}
                  max={1}
                  step={0.05}
                  value={settings.wakeSensitivity}
                  onChange={(e: any) => updateSettings({ wakeSensitivity: parseFloat(e.target.value) })}
                  className="w-28 accent-primary"
                />
              </Row>

              <Row label="Start on Boot" desc="Auto-launch with Windows">
                <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Voice Input</SectionTitle>
              {/* Microphone selector */}
              <div className="py-3 border-b border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/85">Microphone</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Select your input device</p>
                  </div>
                  <button onClick={refreshDevices} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  value={settings.inputDeviceId}
                  onChange={(e) => updateSettings({ inputDeviceId: e.target.value })}
                  className="w-full bg-muted text-[12px] text-foreground/80 px-3 py-2 rounded-lg border border-border font-mono outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">System Default</option>
                  {inputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>

              <Row label="Always Listening" desc="Keep mic active in background">
                <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
              </Row>
              <Row label="Push to Talk" desc="Hold hotkey to speak">
                <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Audio Output</SectionTitle>
              <div className="py-3 border-b border-border/60 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/85">Speaker</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Where Jarvis speaks</p>
                  </div>
                  <button onClick={refreshDevices} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  value={settings.outputDeviceId}
                  onChange={(e) => updateSettings({ outputDeviceId: e.target.value })}
                  className="w-full bg-muted text-[12px] text-foreground/80 px-3 py-2 rounded-lg border border-border font-mono outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">System Default</option>
                  {outputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Clip Settings</SectionTitle>
              <Row label="Buffer Duration" desc="Replay buffer length">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustClip('down')} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-14 text-center text-[12px] font-mono text-foreground/70 bg-muted rounded-lg py-1.5 border border-border">
                    {settings.clipDuration}s
                  </span>
                  <button onClick={() => adjustClip('up')} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Row>
              <Row label="Save Folder">
                <Input value={settings.clipFolder} onChange={(e: any) => updateSettings({ clipFolder: e.target.value })} className="w-48" />
              </Row>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Usage Limits</SectionTitle>
              <Row label="Daily Command Limit" desc="Max voice commands per day">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSettings({ dailyLimit: Math.max(5, (settings.dailyLimit || 25) - 5) })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-14 text-center text-[12px] font-mono text-foreground/70 bg-muted rounded-lg py-1.5 border border-border">
                    {settings.dailyLimit || 25}
                  </span>
                  <button
                    onClick={() => updateSettings({ dailyLimit: Math.min(500, (settings.dailyLimit || 25) + 5) })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Row>
            </div>
              <Row label="WebSocket URL">
                <Input value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-44" />
              </Row>
              <Row label="Password">
                <Input type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-44" placeholder="••••••" />
              </Row>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Voice Selection</SectionTitle>
              <div className="space-y-1.5">
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => updateSettings({ voice: v.id, voiceId: v.elevenLabsId })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      settings.voice === v.id
                        ? 'bg-primary/10 border border-primary/25'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                      settings.voice === v.id ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/85">{v.label}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{v.description}</p>
                    </div>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                      onClick={(e) => { e.stopPropagation(); handlePreview(v.id, v.elevenLabsId); }}
                      disabled={previewing !== null}
                    >
                      {previewing === v.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>Keyboard Shortcuts</SectionTitle>
              {[
                { label: 'Clip Last 30s', key: 'Ctrl+Shift+C' },
                { label: 'Toggle Recording', key: 'Ctrl+Shift+R' },
                { label: 'Toggle Mic', key: 'Ctrl+Shift+M' },
                { label: 'Push to Talk', key: 'Ctrl+Space' },
                { label: 'Show / Hide', key: 'Ctrl+Shift+J' },
              ].map(({ label, key }) => (
                <Row key={label} label={label}>
                  <kbd className="text-[11px] font-mono px-3 py-1 bg-muted rounded-lg border border-border text-muted-foreground">{key}</kbd>
                </Row>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
