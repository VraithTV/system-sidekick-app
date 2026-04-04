import { useJarvisStore } from '@/store/jarvisStore';
import { Volume2, Minus, Plus, Mic, Radio, Folder, Link, Keyboard, Play } from 'lucide-react';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useState } from 'react';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">{children}</h3>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
    <div className="mr-4">
      <p className="text-xs text-foreground">{label}</p>
      {desc && <p className="text-[9px] text-muted-foreground/40 font-mono mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-9 h-5 rounded-full transition-all relative ${
      checked ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
      checked ? 'left-[18px] bg-primary-foreground' : 'left-0.5 bg-muted-foreground/60'
    }`} />
  </button>
);

const InputField = ({ value, onChange, className = 'w-36', ...props }: any) => (
  <input
    value={value}
    onChange={onChange}
    className={`${className} bg-secondary/50 text-xs text-foreground px-2.5 py-1.5 rounded-md border border-border/30 font-mono text-right outline-none focus:border-primary/50 transition-colors`}
    {...props}
  />
);

const clipDurations = [15, 30, 45, 60, 90, 120];

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant();
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const adjustClip = (dir: 'up' | 'down') => {
    const i = clipDurations.indexOf(settings.clipDuration);
    if (dir === 'up' && i < clipDurations.length - 1) updateSettings({ clipDuration: clipDurations[i + 1] });
    else if (dir === 'down' && i > 0) updateSettings({ clipDuration: clipDurations[i - 1] });
    else if (i === -1) updateSettings({ clipDuration: 30 });
  };

  const handlePreview = async (id: string, elevenLabsId: string) => {
    setPreviewingVoice(id);
    await previewVoice(elevenLabsId);
    setPreviewingVoice(null);
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <h2 className="font-display text-sm text-primary glow-text tracking-wider mb-5">SETTINGS</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* General */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>General</SectionLabel>
            <Row label="Wake Word" desc="Activation name">
              <InputField value={settings.wakeName} onChange={(e: any) => updateSettings({ wakeName: e.target.value })} className="w-28" />
            </Row>
            <Row label="Start on Boot" desc="Auto-launch with Windows">
              <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
            </Row>
          </div>

          {/* Voice & Input */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>Voice & Input</SectionLabel>
            <Row label="Always Listening" desc="Keep mic active for wake word">
              <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
            </Row>
            <Row label="Push to Talk" desc="Hold hotkey to speak">
              <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
            </Row>
          </div>

          {/* Clipping */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>Clipping</SectionLabel>
            <Row label="Clip Duration" desc="Replay buffer length">
              <div className="flex items-center gap-0.5">
                <button onClick={() => adjustClip('down')} className="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-12 text-center text-xs font-mono text-foreground bg-secondary/50 rounded-md py-1.5 border border-border/30">
                  {settings.clipDuration}s
                </span>
                <button onClick={() => adjustClip('up')} className="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </Row>
            <Row label="Save Folder" desc="Clip storage path">
              <InputField value={settings.clipFolder} onChange={(e: any) => updateSettings({ clipFolder: e.target.value })} className="w-48" />
            </Row>
          </div>

          {/* OBS */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>OBS Connection</SectionLabel>
            <Row label="WebSocket URL">
              <InputField value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-40" />
            </Row>
            <Row label="Password">
              <InputField type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-40" placeholder="••••••••" />
            </Row>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Voice Selection */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>Voice</SectionLabel>
            <div className="space-y-1">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => updateSettings({ voice: voice.id, voiceId: voice.elevenLabsId })}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-md transition-all text-left ${
                    settings.voice === voice.id
                      ? 'bg-primary/10 border border-primary/25'
                      : 'hover:bg-secondary/40 border border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    settings.voice === voice.id ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{voice.label}</p>
                    <p className="text-[9px] text-muted-foreground/40 font-mono truncate">{voice.description}</p>
                  </div>
                  <button
                    className="w-7 h-7 rounded-md text-primary/40 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(voice.id, voice.elevenLabsId);
                    }}
                    disabled={previewingVoice !== null}
                  >
                    {previewingVoice === voice.id ? (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Hotkeys */}
          <div className="glass rounded-lg p-4">
            <SectionLabel>Hotkeys</SectionLabel>
            {[
              { label: 'Clip Last 30s', key: 'Ctrl+Shift+C' },
              { label: 'Toggle Rec', key: 'Ctrl+Shift+R' },
              { label: 'Toggle Mic', key: 'Ctrl+Shift+M' },
              { label: 'Push to Talk', key: 'Ctrl+Space' },
              { label: 'Show/Hide', key: 'Ctrl+Shift+J' },
            ].map(({ label, key }) => (
              <Row key={label} label={label}>
                <kbd className="text-[10px] font-mono px-2 py-1 bg-secondary/50 rounded border border-border/30 text-muted-foreground/60">{key}</kbd>
              </Row>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
