import { useJarvisStore } from '@/store/jarvisStore';
import { Volume2, Minus, Plus, Mic, Radio, Folder, Link, Keyboard, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { voiceOptions, getVoiceById } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useState } from 'react';

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">{title}</h3>
  </div>
);

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
    <div className="flex-1 min-w-0 mr-4">
      <p className="text-sm text-foreground font-medium">{label}</p>
      {description && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
      checked ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]' : 'bg-muted'
    }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
        checked ? 'left-[24px] bg-primary-foreground' : 'left-1 bg-muted-foreground'
      }`}
    />
  </button>
);

const clipDurations = [15, 30, 45, 60, 90, 120];

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant();
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const adjustClipDuration = (direction: 'up' | 'down') => {
    const currentIndex = clipDurations.indexOf(settings.clipDuration);
    if (direction === 'up' && currentIndex < clipDurations.length - 1) {
      updateSettings({ clipDuration: clipDurations[currentIndex + 1] });
    } else if (direction === 'down' && currentIndex > 0) {
      updateSettings({ clipDuration: clipDurations[currentIndex - 1] });
    } else if (currentIndex === -1) {
      updateSettings({ clipDuration: 30 });
    }
  };

  const handlePreviewVoice = async (voiceId: string, elevenLabsId: string) => {
    setPreviewingVoice(voiceId);
    await previewVoice(elevenLabsId);
    setPreviewingVoice(null);
  };

  const handleSelectVoice = (voice: typeof voiceOptions[0]) => {
    updateSettings({ voice: voice.id, voiceId: voice.elevenLabsId });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="font-display text-lg text-primary glow-text tracking-wider">SETTINGS</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">Configure your assistant</p>
        </div>

        {/* General */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Radio} title="General" />
          <SettingRow label="Wake Word" description="The name to activate your assistant">
            <input
              value={settings.wakeName}
              onChange={(e) => updateSettings({ wakeName: e.target.value })}
              className="w-32 bg-secondary/80 text-sm text-foreground px-3 py-2 rounded-lg border border-border/50 font-mono text-right outline-none focus:border-primary transition-colors"
            />
          </SettingRow>
          <SettingRow label="Start on Boot" description="Launch when Windows starts">
            <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
          </SettingRow>
        </div>

        {/* Voice Selection */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Volume2} title="Voice" />
          <p className="text-xs text-muted-foreground font-mono mb-4">Choose how your assistant sounds</p>
          <div className="grid gap-2">
            {voiceOptions.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleSelectVoice(voice)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  settings.voice === voice.id
                    ? 'border-primary/50 bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.1)]'
                    : 'border-border/30 bg-secondary/30 hover:bg-secondary/50 hover:border-border/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  settings.voice === voice.id ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/30'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{voice.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{voice.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary/60 hover:text-primary hover:bg-primary/10 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewVoice(voice.id, voice.elevenLabsId);
                  }}
                  disabled={previewingVoice !== null}
                >
                  {previewingVoice === voice.id ? (
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </Button>
              </button>
            ))}
          </div>
        </div>

        {/* Voice & Input */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Mic} title="Voice & Input" />
          <SettingRow label="Always Listening" description="Keep microphone active for wake word">
            <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
          </SettingRow>
          <SettingRow label="Push to Talk" description="Hold hotkey to activate voice input">
            <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
          </SettingRow>
        </div>

        {/* Clipping */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Folder} title="Clipping" />
          <SettingRow label="Clip Duration" description="Default replay buffer length">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                onClick={() => adjustClipDuration('down')}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-14 text-center text-sm font-mono text-foreground bg-secondary/80 rounded-lg px-2 py-2 border border-border/50">
                {settings.clipDuration}s
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                onClick={() => adjustClipDuration('up')}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </SettingRow>
          <SettingRow label="Save Folder" description="Where clips are stored">
            <input
              value={settings.clipFolder}
              onChange={(e) => updateSettings({ clipFolder: e.target.value })}
              className="w-56 bg-secondary/80 text-sm text-foreground px-3 py-2 rounded-lg border border-border/50 font-mono text-right outline-none focus:border-primary transition-colors"
            />
          </SettingRow>
        </div>

        {/* OBS Connection */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Link} title="OBS Connection" />
          <SettingRow label="WebSocket URL" description="OBS WebSocket server address">
            <input
              value={settings.obsWebsocketUrl}
              onChange={(e) => updateSettings({ obsWebsocketUrl: e.target.value })}
              className="w-48 bg-secondary/80 text-sm text-foreground px-3 py-2 rounded-lg border border-border/50 font-mono text-right outline-none focus:border-primary transition-colors"
            />
          </SettingRow>
          <SettingRow label="Password" description="OBS WebSocket password (if set)">
            <input
              type="password"
              value={settings.obsWebsocketPassword}
              onChange={(e) => updateSettings({ obsWebsocketPassword: e.target.value })}
              className="w-48 bg-secondary/80 text-sm text-foreground px-3 py-2 rounded-lg border border-border/50 font-mono text-right outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </SettingRow>
        </div>

        {/* Hotkeys */}
        <div className="glass rounded-xl p-5">
          <SectionHeader icon={Keyboard} title="Hotkeys" />
          {[
            { label: 'Clip Last 30s', key: 'Ctrl + Shift + C' },
            { label: 'Toggle Recording', key: 'Ctrl + Shift + R' },
            { label: 'Toggle Mic', key: 'Ctrl + Shift + M' },
            { label: 'Push to Talk', key: 'Ctrl + Space' },
            { label: 'Show/Hide UI', key: 'Ctrl + Shift + J' },
          ].map(({ label, key }) => (
            <SettingRow key={label} label={label}>
              <kbd className="text-[11px] font-mono px-3 py-1.5 bg-secondary/80 rounded-lg border border-border/50 text-muted-foreground tracking-wide">
                {key}
              </kbd>
            </SettingRow>
          ))}
        </div>
      </div>
    </div>
  );
};
