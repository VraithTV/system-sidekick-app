import { useJarvisStore } from '@/store/jarvisStore';
import { Minus, Plus, Play, X, RefreshCw, Download, Unlink, Cpu, Globe } from 'lucide-react';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useState, useEffect, useCallback } from 'react';
import { isSpotifyConnected, clearSpotifyTokens, exchangeSpotifyCode } from '@/lib/spotifyClient';
import spotifyLogo from '@/assets/spotify-logo.png';
import { UpdatePrompt } from '@/components/jarvis/UpdatePrompt';
import { UpdateProgressScreen } from '@/components/jarvis/UpdateProgressScreen';
import { isOllamaAvailable, listOllamaModels, resetOllamaStatus, getOllamaModel } from '@/lib/ollamaClient';
import { languages } from '@/lib/languages';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

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

const OllamaSection = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [models, setModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState('');

  const check = useCallback(async () => {
    setStatus('checking');
    resetOllamaStatus();
    const available = await isOllamaAvailable();
    if (available) {
      setStatus('connected');
      setActiveModel(getOllamaModel());
      const list = await listOllamaModels();
      setModels(list);
    } else {
      setStatus('offline');
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <SectionTitle>AI Engine</SectionTitle>
      <div className="flex items-center justify-between py-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-primary/70" />
          <div>
            <p className="text-[13px] text-foreground/85">Ollama (Local AI)</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {status === 'checking' && 'Checking...'}
              {status === 'connected' && `Connected. Model: ${activeModel}`}
              {status === 'offline' && 'Not detected. Using cloud AI as fallback.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            status === 'connected' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' :
            status === 'offline' ? 'bg-muted-foreground/30' :
            'bg-yellow-500 animate-pulse'
          }`} />
          <button onClick={check} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {status === 'connected' && models.length > 1 && (
        <div className="pt-3">
          <p className="text-[10px] text-muted-foreground font-mono mb-2">Available models</p>
          <div className="flex flex-wrap gap-1.5">
            {models.map((m) => (
              <span key={m} className={`text-[10px] px-2 py-1 rounded-md font-mono ${
                m === activeModel ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-muted text-muted-foreground'
              }`}>{m}</span>
            ))}
          </div>
        </div>
      )}
      {status === 'offline' && (
        <div className="pt-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Install <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ollama</a> and
            run <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-[9px]">ollama pull llama3</code> to
            enable free local AI. Cloud AI (GPT-5.2) is used as fallback.
          </p>
        </div>
      )}
    </div>
  );
};

export const SettingsView = () => {
  const { settings, updateSettings } = useJarvisStore();
  const t = createT(settings.language || 'en');
  const { previewVoice } = useVoiceAssistant({ previewOnly: true });
  const { inputs, outputs, refresh: refreshDevices } = useAudioDevices();
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(isSpotifyConnected());
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'prompt' | 'downloading' | 'updating' | 'no-update' | 'error'>('idle');
  const [updateVersion, setUpdateVersion] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');
  const [updateAssetName, setUpdateAssetName] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [currentVersion, setCurrentVersion] = useState('0.0.0');

  // Fetch current version on mount (Electron only)
  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI?.getAppVersion?.().then((v: string) => {
        if (v) setCurrentVersion(v);
      });
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (!isElectron) return;
    setUpdateError('');
    setUpdateState('checking');
    try {
      const result = await (window as any).electronAPI?.checkForUpdates?.();
      if (result?.status === 'available' && result.remoteVersion && result.remoteVersion !== currentVersion) {
        setUpdateVersion(result.remoteVersion);
        setUpdateUrl(result.downloadUrl || '');
        setUpdateAssetName(result.assetName || '');
        setUpdateState('prompt');
        return;
      }

      if (result?.status === 'up-to-date') {
        setUpdateState('no-update');
        setTimeout(() => setUpdateState('idle'), 2500);
        return;
      }

      setUpdateError(result?.message || 'Could not reach the GitHub releases feed.');
      setUpdateState('error');
      setTimeout(() => setUpdateState('idle'), 4000);
    } catch {
      setUpdateError('Could not reach the GitHub releases feed.');
      setUpdateState('error');
      setTimeout(() => setUpdateState('idle'), 4000);
    }
  };

  const handleUpdateNow = useCallback(async () => {
    setUpdateState('updating');
    if (!isElectron || !updateUrl) return;
    try {
      const result = await (window as any).electronAPI?.downloadUpdate?.(updateUrl, updateAssetName);
      if (result?.status === 'downloaded' && result.filePath) {
        // Install and restart
        await (window as any).electronAPI?.installUpdate?.(result.filePath);
      } else {
        setUpdateError(result?.message || 'Download failed.');
        setUpdateState('error');
        setTimeout(() => setUpdateState('idle'), 4000);
      }
    } catch {
      setUpdateError('Download failed. Please try again.');
      setUpdateState('error');
      setTimeout(() => setUpdateState('idle'), 4000);
    }
  }, [updateUrl, updateAssetName]);

  const handleUpdateLater = useCallback(() => {
    if (isElectron && updateVersion) {
      (window as any).electronAPI?.dismissUpdate?.(updateVersion);
    }
    setUpdateState('idle');
  }, [updateVersion]);

  // Listen for Spotify OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const redirectUri = 'http://127.0.0.1:8080';
      exchangeSpotifyCode(code, redirectUri).then((ok) => {
        if (ok) setSpotifyConnected(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, []);

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
        <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">{t('settings.title')}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>{t('settings.general')}</SectionTitle>
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
              <SectionTitle>{t('settings.voiceInput')}</SectionTitle>
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
              <SectionTitle>{t('settings.audioOutput')}</SectionTitle>
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
              <SectionTitle>OBS Connection</SectionTitle>
              <Row label="WebSocket URL">
                <Input value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-44" />
              </Row>
              <Row label="Password">
                <Input type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-44" placeholder="••••••" />
              </Row>
            </div>

            <OllamaSection />
            </div>

          <div className="space-y-5">
            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>{t('settings.voiceSelection')}</SectionTitle>
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
              <SectionTitle>{t('settings.language')}</SectionTitle>
              <p className="text-[10px] text-muted-foreground mb-4">{t('settings.langDesc')}</p>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateSettings({ language: lang.code })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      (settings.language || 'en') === lang.code
                        ? 'bg-primary/10 border border-primary/25'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <img src={getFlagUrl(lang.countryCode)} alt={lang.label} className="w-6 h-[18px] rounded-sm object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/85">{lang.label}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{lang.nativeLabel}</p>
                    </div>
                    {(settings.language || 'en') === lang.code && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>{t('settings.shortcuts')}</SectionTitle>
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

            <div className="bg-card rounded-xl p-6 border border-border">
              <SectionTitle>{t('settings.connections')}</SectionTitle>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <img src={spotifyLogo} alt="Spotify" className="w-9 h-9 rounded-lg" loading="lazy" width={36} height={36} />
                  <div>
                    <p className="text-[13px] text-foreground/85">Spotify</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {spotifyConnected ? 'Connected. Direct playback enabled.' : 'Control music playback with voice commands.'}
                    </p>
                  </div>
                </div>
                {spotifyConnected ? (
                  <button
                    onClick={() => { clearSpotifyTokens(); setSpotifyConnected(false); }}
                    className="flex items-center gap-2 text-[12px] font-mono px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg border border-destructive/30 transition-colors"
                  >
                    <Unlink size={14} />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const { supabase } = await import('@/integrations/supabase/client');
                        const { data, error } = await supabase.functions.invoke('spotify-auth', {
                          body: { action: 'get-auth-url', redirect_uri: 'http://127.0.0.1:8080' },
                        });
                        if (error || !data?.url) {
                          console.error('[Spotify] Could not get auth URL:', error);
                          return;
                        }
                        if (isElectron && (window as any).electronAPI?.spotifyAuth) {
                          const result = await (window as any).electronAPI.spotifyAuth(data.url);
                          if (result?.code) {
                            const ok = await exchangeSpotifyCode(result.code, 'http://127.0.0.1:8080');
                            if (ok) setSpotifyConnected(true);
                          }
                        } else {
                          window.location.href = data.url;
                        }
                      } catch (e) {
                        console.error('[Spotify] Auth error:', e);
                      }
                    }}
                    className="flex items-center gap-2 text-[12px] font-mono px-4 py-2 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] rounded-lg border border-[#1DB954]/30 transition-colors"
                  >
                    <img src={spotifyLogo} alt="" className="w-3.5 h-3.5" width={14} height={14} />
                    Connect
                  </button>
                )}
              </div>
            </div>

            {isElectron && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <SectionTitle>Updates</SectionTitle>
                <Row
                  label="Check for Updates"
                  desc={
                    updateState === 'error' && updateError
                      ? updateError
                      : currentVersion !== '0.0.0'
                        ? `Current: v${currentVersion}`
                        : 'See if a newer version is available'
                  }
                >
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={updateState === 'checking'}
                    className="flex items-center gap-2 text-[12px] font-mono px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 transition-colors disabled:opacity-50"
                  >
                    {updateState === 'checking' ? (
                      <div className="w-3.5 h-3.5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {updateState === 'checking' ? 'Checking...' : updateState === 'no-update' ? 'Up to Date' : updateState === 'error' ? 'Check Failed' : 'Check Now'}
                  </button>
                </Row>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpdatePrompt
        open={updateState === 'prompt'}
        currentVersion={currentVersion}
        newVersion={updateVersion}
        onDismiss={() => setUpdateState('idle')}
        onUpdateNow={handleUpdateNow}
        onUpdateLater={handleUpdateLater}
      />

      <UpdateProgressScreen
        open={updateState === 'updating'}
        newVersion={updateVersion}
        onComplete={() => {}}
      />
    </div>
  );
};
