import { useJarvisStore } from '@/store/jarvisStore';

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

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();

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
          <select
            value={settings.voice}
            onChange={(e) => updateSettings({ voice: e.target.value })}
            className="bg-secondary text-sm text-foreground px-3 py-1.5 rounded border border-border font-mono outline-none focus:border-primary"
          >
            <option>Neural English (Male)</option>
            <option>Neural English (Female)</option>
            <option>Classic Jarvis</option>
          </select>
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.clipDuration}
              onChange={(e) => updateSettings({ clipDuration: parseInt(e.target.value) || 30 })}
              className="w-16 bg-secondary text-sm text-foreground px-2 py-1.5 rounded border border-border font-mono text-right outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground font-mono">sec</span>
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
