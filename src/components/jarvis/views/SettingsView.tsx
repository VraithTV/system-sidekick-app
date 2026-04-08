import { useJarvisStore } from '@/store/jarvisStore';
import { Minus, Plus, Play, X, RefreshCw, Download, Unlink } from 'lucide-react';
import { jarvisVoices, standardVoices } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useState, useEffect, useCallback } from 'react';
import { isSpotifyConnected, clearSpotifyTokens, exchangeSpotifyCode } from '@/lib/spotifyClient';
import spotifyLogo from '@/assets/spotify-logo.png';
import { UpdatePrompt } from '@/components/jarvis/UpdatePrompt';
import { UpdateProgressScreen } from '@/components/jarvis/UpdateProgressScreen';
import { languages, getFlagUrl } from '@/lib/languages';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-display text-[11px] tracking-[0.2em] text-primary/70 uppercase mb-5 flex items-center gap-2">
    <span className="h-px flex-1 bg-primary/10" />
    <span>{children}</span>
    <span className="h-px flex-1 bg-primary/10" />
  </p>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
    <div className="mr-4">
      <p className="text-[13px] text-foreground/90 font-medium">{label}</p>
      {desc && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-11 h-[24px] rounded-full transition-all relative ${
      checked ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]' : 'bg-muted'
    }`}
  >
    <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all shadow-sm ${
      checked ? 'left-[22px] bg-primary-foreground' : 'left-[3px] bg-muted-foreground/50'
    }`} />
  </button>
);

const Input = ({ className = 'w-36', ...props }: any) => (
  <input
    className={`${className} bg-muted/60 text-[12px] text-foreground/80 px-3 py-2.5 rounded-lg border border-border/60 font-mono text-right outline-none focus:border-primary/50 focus:bg-muted transition-all`}
    {...props}
  />
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm ${className}`}>
    {children}
  </div>
);

const clipDurations = [15, 30, 45, 60, 90, 120];

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const redirectUri = 'http://127.0.0.1:8080';
      exchangeSpotifyCode(code, redirectUri).then((ok) => {
        if (ok) setSpotifyConnected(true);
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

  const VoiceCard = ({ v }: { v: typeof jarvisVoices[0] }) => (
    <button
      key={v.id}
      onClick={() => updateSettings({ voice: v.id, voiceId: v.elevenLabsId })}
      className={`w-full flex items-center gap-3 p-3.5 rounded-lg transition-all text-left group ${
        settings.voice === v.id
          ? 'bg-primary/10 border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.08)]'
          : 'hover:bg-muted/80 border border-transparent'
      }`}
    >
      <div className={`w-3 h-3 rounded-full shrink-0 transition-all ${
        settings.voice === v.id ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/20 group-hover:bg-muted-foreground/40'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground/90 font-medium">{v.label}</p>
        <p className="text-[10px] text-muted-foreground font-mono truncate">{t(`voice.${v.id}`)}</p>
      </div>
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/30 hover:text-primary hover:bg-primary/10 transition-all shrink-0"
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
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">{t('settings.title')}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <Card>
              <SectionTitle>{t('settings.general')}</SectionTitle>
              <Row label={t('settings.wakeWord')} desc={t('settings.wakeWordDesc')}>
                <Input value={settings.wakeName} onChange={(e: any) => updateSettings({ wakeName: e.target.value })} className="w-28" />
              </Row>

              <div className="py-3.5 border-b border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/90 font-medium">{t('settings.wakeAliases')}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{t('settings.wakeAliasesDesc')}</p>
                  </div>
                  <button
                    onClick={() => {
                      const alias = prompt(t('settings.addAlias'));
                      if (alias?.trim()) updateSettings({ wakeAliases: [...settings.wakeAliases, alias.trim()] });
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {settings.wakeAliases.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/50 font-mono">{t('settings.noneYet')}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {settings.wakeAliases.map((alias, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] font-mono bg-muted/80 px-2.5 py-1 rounded-lg border border-border/60 text-foreground/70">
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

              <Row label={t('settings.wakeSensitivity')} desc={`${Math.round(settings.wakeSensitivity * 100)}%`}>
                <input
                  type="range" min={0.3} max={1} step={0.05}
                  value={settings.wakeSensitivity}
                  onChange={(e: any) => updateSettings({ wakeSensitivity: parseFloat(e.target.value) })}
                  className="w-28 accent-primary"
                />
              </Row>

              <Row label={t('settings.startOnBoot')} desc={t('settings.startOnBootDesc')}>
                <Toggle checked={settings.startOnBoot} onChange={() => updateSettings({ startOnBoot: !settings.startOnBoot })} />
              </Row>
            </Card>

            <Card>
              <SectionTitle>{t('settings.voiceInput')}</SectionTitle>
              <div className="py-3.5 border-b border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/90 font-medium">{t('settings.microphone')}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{t('settings.micDesc')}</p>
                  </div>
                  <button onClick={refreshDevices} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  value={settings.inputDeviceId}
                  onChange={(e) => updateSettings({ inputDeviceId: e.target.value })}
                  className="w-full bg-muted/60 text-[12px] text-foreground/80 px-3 py-2.5 rounded-lg border border-border/60 font-mono outline-none focus:border-primary/50 transition-all"
                >
                  <option value="">{t('settings.systemDefault')}</option>
                  {inputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>

              <Row label={t('settings.alwaysListening')} desc={t('settings.alwaysListeningDesc')}>
                <Toggle checked={settings.alwaysListening} onChange={() => updateSettings({ alwaysListening: !settings.alwaysListening })} />
              </Row>
              <Row label={t('settings.pushToTalk')} desc={t('settings.pushToTalkDesc')}>
                <Toggle checked={settings.pushToTalk} onChange={() => updateSettings({ pushToTalk: !settings.pushToTalk })} />
              </Row>
            </Card>

            <Card>
              <SectionTitle>{t('settings.audioOutput')}</SectionTitle>
              <div className="py-3.5 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] text-foreground/90 font-medium">{t('settings.speaker')}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{t('settings.speakerDesc')}</p>
                  </div>
                  <button onClick={refreshDevices} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  value={settings.outputDeviceId}
                  onChange={(e) => updateSettings({ outputDeviceId: e.target.value })}
                  className="w-full bg-muted/60 text-[12px] text-foreground/80 px-3 py-2.5 rounded-lg border border-border/60 font-mono outline-none focus:border-primary/50 transition-all"
                >
                  <option value="">{t('settings.systemDefault')}</option>
                  {outputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>
            </Card>

            <Card>
              <SectionTitle>{t('settings.clipSettings')}</SectionTitle>
              <Row label={t('settings.bufferDuration')} desc={t('settings.bufferDurationDesc')}>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustClip('down')} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-14 text-center text-[12px] font-mono text-foreground/70 bg-muted/60 rounded-lg py-1.5 border border-border/60">
                    {settings.clipDuration}s
                  </span>
                  <button onClick={() => adjustClip('up')} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Row>
              <Row label={t('settings.saveFolder')}>
                <Input value={settings.clipFolder} onChange={(e: any) => updateSettings({ clipFolder: e.target.value })} className="w-48" />
              </Row>
            </Card>

            <Card>
              <SectionTitle>{t('settings.obsConnection')}</SectionTitle>
              <Row label={t('settings.websocketUrl')}>
                <Input value={settings.obsWebsocketUrl} onChange={(e: any) => updateSettings({ obsWebsocketUrl: e.target.value })} className="w-44" />
              </Row>
              <Row label={t('settings.password')}>
                <Input type="password" value={settings.obsWebsocketPassword} onChange={(e: any) => updateSettings({ obsWebsocketPassword: e.target.value })} className="w-44" placeholder="••••••" />
              </Row>
            </Card>

            <Card>
              <SectionTitle>{t('settings.connections')}</SectionTitle>
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <img src={spotifyLogo} alt="Spotify" className="w-9 h-9 rounded-lg" loading="lazy" width={36} height={36} />
                  <div>
                    <p className="text-[13px] text-foreground/90 font-medium">{t('settings.spotify')}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {spotifyConnected ? t('settings.spotifyConnected') : t('settings.spotifyDesc')}
                    </p>
                  </div>
                </div>
                {spotifyConnected ? (
                  <button
                    onClick={() => { clearSpotifyTokens(); setSpotifyConnected(false); }}
                    className="flex items-center gap-2 text-[12px] font-mono px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg border border-destructive/30 transition-colors"
                  >
                    <Unlink size={14} />
                    {t('settings.disconnect')}
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
                    {t('settings.connect')}
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <Card>
              <SectionTitle>{t('settings.voiceSelection')}</SectionTitle>

              <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-2 mt-1">Jarvis</p>
              <div className="space-y-1.5 mb-5">
                {jarvisVoices.map((v) => <VoiceCard key={v.id} v={v} />)}
              </div>

              <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-2">Standard Voices</p>
              <div className="space-y-1.5">
                {standardVoices.map((v) => <VoiceCard key={v.id} v={v} />)}
              </div>
            </Card>

            <Card>
              <SectionTitle>{t('settings.language')}</SectionTitle>
              <p className="text-[10px] text-muted-foreground mb-4">{t('settings.langDesc')}</p>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateSettings({ language: lang.code })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      (settings.language || 'en') === lang.code
                        ? 'bg-primary/10 border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.08)]'
                        : 'hover:bg-muted/80 border border-transparent'
                    }`}
                  >
                    <img src={getFlagUrl(lang.countryCode)} alt={lang.label} className="w-6 h-[18px] rounded-sm object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/90 font-medium">{lang.label}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{lang.nativeLabel}</p>
                    </div>
                    {(settings.language || 'en') === lang.code && (
                      <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle>{t('settings.shortcuts')}</SectionTitle>
              {[
                { label: 'Clip Last 30s', key: 'Ctrl+Shift+C' },
                { label: 'Toggle Recording', key: 'Ctrl+Shift+R' },
                { label: 'Toggle Mic', key: 'Ctrl+Shift+M' },
                { label: 'Push to Talk', key: 'Ctrl+Space' },
                { label: 'Show / Hide', key: 'Ctrl+Shift+J' },
              ].map(({ label, key }) => (
                <Row key={label} label={label}>
                  <kbd className="text-[11px] font-mono px-3 py-1.5 bg-muted/60 rounded-lg border border-border/60 text-muted-foreground">{key}</kbd>
                </Row>
              ))}
            </Card>

            {isElectron && (
              <Card>
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
              </Card>
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
