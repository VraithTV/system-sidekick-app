import { useJarvisStore } from '@/store/jarvisStore';
import { Volume2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50">
    <div>
      <p className="text-sm text-foreground">{label}</p>
      {description && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

const voiceOptions = [
  { id: 'neural-male', label: 'Neural English (Male)', sample: 'Hello, I am your assistant. How can I help you today?' },
  { id: 'neural-female', label: 'Neural English (Female)', sample: 'Hello, I am your assistant. How can I help you today?' },
  { id: 'classic-jarvis', label: 'Classic Jarvis', sample: 'At your service. What would you like me to do?' },
];

const previewVoice = (voiceLabel: string) => {
  speechSynthesis.cancel();
  const sample = voiceOptions.find(v => v.label === voiceLabel)?.sample || 'Hello, I am your assistant.';
  const utterance = new SpeechSynthesisUtterance(sample);
  utterance.rate = 0.95;
  utterance.pitch = voiceLabel.includes('Female') ? 1.1 : 0.9;
  utterance.volume = 1;

  const voices = speechSynthesis.getVoices();
  if (voiceLabel.includes('Female')) {
    const female = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'));
    if (female) utterance.voice = female;
  } else {
    const male = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en') && v.name.includes('Male'))
      || voices.find(v => v.lang.startsWith('en'));
    if (male) utterance.voice = male;
  }

  speechSynthesis.speak(utterance);
};

const clipDurations = [15, 30, 45, 60, 90, 120];

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();

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

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="font-display text-lg text-primary glow-text tracking-wider">SETTINGS</h2>
        <p className="text-xs text-muted-foreground font-mono mt-1">Configure your assistant</p>
      </div>

      {/* General */}
      <div className="glass rounded-lg p-4 space-y-1">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase mb-2">General</h3>
        <SettingRow label="Wake Word" description="The name to activate your assistant">
          <input
            value={settings.wakeName}
            onChange={(e) => updateSettings({ wakeName: e.target.value })}
            className="w-32 bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono text-right outline-none focus:border-primary"
          />
        </SettingRow>
        <SettingRow label="Voice" description="Assistant voice style">
          <div className="flex items-center gap-2">
            <select
              value={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.value })}
              className="bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono outline-none focus:border-primary appearance-none pr-8"
              style={{ backgroundImage: 'none' }}
            >
              {voiceOptions.map(v => (
                <option key={v.id} value={v.label}>{v.label}</option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => previewVoice(settings.voice)}
              title="Preview voice"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </SettingRow>
        <SettingRow label="Start on Boot" description="Launch when Windows starts">
          <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
        </SettingRow>
      </div>

      {/* Voice */}
      <div className="glass rounded-lg p-4 space-y-1">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase mb-2">Voice & Input</h3>
        <SettingRow label="Always Listening" description="Keep microphone active for wake word">
          <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
        </SettingRow>
        <SettingRow label="Push to Talk" description="Hold hotkey to activate voice input">
          <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
        </SettingRow>
      </div>

      {/* Clips */}
      <div className="glass rounded-lg p-4 space-y-1">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase mb-2">Clipping</h3>
        <SettingRow label="Clip Duration" description="Default replay buffer length">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => adjustClipDuration('down')}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-14 text-center text-sm font-mono text-foreground bg-secondary rounded px-2 py-1.5 border border-border">
              {settings.clipDuration}s
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
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
            className="w-64 bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono text-right outline-none focus:border-primary"
          />
        </SettingRow>
      </div>

      {/* OBS */}
      <div className="glass rounded-lg p-4 space-y-1">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase mb-2">OBS Connection</h3>
        <SettingRow label="WebSocket URL" description="OBS WebSocket server address">
          <input
            value={settings.obsWebsocketUrl}
            onChange={(e) => updateSettings({ obsWebsocketUrl: e.target.value })}
            className="w-48 bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono text-right outline-none focus:border-primary"
          />
        </SettingRow>
        <SettingRow label="Password" description="OBS WebSocket password (if set)">
          <input
            type="password"
            value={settings.obsWebsocketPassword}
            onChange={(e) => updateSettings({ obsWebsocketPassword: e.target.value })}
            className="w-48 bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono text-right outline-none focus:border-primary"
            placeholder="••••••••"
          />
        </SettingRow>
      </div>

      {/* Hotkeys */}
      <div className="glass rounded-lg p-4 space-y-1">
        <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase mb-2">Hotkeys</h3>
        {[
          { label: 'Clip Last 30s', key: 'Ctrl + Shift + C' },
          { label: 'Toggle Recording', key: 'Ctrl + Shift + R' },
          { label: 'Toggle Mic', key: 'Ctrl + Shift + M' },
          { label: 'Push to Talk', key: 'Ctrl + Space' },
          { label: 'Show/Hide UI', key: 'Ctrl + Shift + J' },
        ].map(({ label, key }) => (
          <SettingRow key={label} label={label}>
            <span className="text-xs font-mono px-3 py-1.5 bg-secondary rounded border border-border text-muted-foreground">{key}</span>
          </SettingRow>
        ))}
      </div>
    </div>
  );
};
