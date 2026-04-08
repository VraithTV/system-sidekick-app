import { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import type { Clip } from '@/types/jarvis';
import { Film, Scissors, Trash2, Play, FolderOpen, Circle, Square, Clock, HardDrive, Settings2 } from 'lucide-react';
import { ClipOverlay } from '@/components/jarvis/clips/ClipOverlay';
import { ClipTrimmer } from '@/components/jarvis/clips/ClipTrimmer';
import { ClipDurationPicker } from '@/components/jarvis/clips/ClipDurationPicker';
import { createT } from '@/lib/i18n';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatTime = (date: Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

export const ClipsView = () => {
  const { clips, settings, updateSettings, addClip } = useJarvisStore();
  const t = createT(settings.language || 'en');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [bufferActive, setBufferActive] = useState(true);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [trimmingClip, setTrimmingClip] = useState<Clip | null>(null);

  // Overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<'recording-started' | 'clip-saved'>('clip-saved');
  const [overlayFilename, setOverlayFilename] = useState('');
  const [overlayDuration, setOverlayDuration] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    if (api?.onClipSaved) {
      api.onClipSaved((clip: Clip) => {
        addClip(clip);
        showOverlay('clip-saved', clip.filename, clip.duration);
      });
    }
  }, [addClip]);

  const showOverlay = (variant: 'recording-started' | 'clip-saved', filename: string, duration: number) => {
    setOverlayVariant(variant);
    setOverlayFilename(filename);
    setOverlayDuration(duration);
    setOverlayVisible(true);
  };

  const handleClipNow = useCallback(() => {
    if (isElectron && (window as any).electronAPI?.clipNow) {
      (window as any).electronAPI.clipNow(settings.clipDuration);
    } else {
      const clip: Clip = {
        id: Date.now().toString(),
        filename: `Clip_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`,
        duration: settings.clipDuration,
        timestamp: new Date(),
        size: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
      };
      addClip(clip);
      showOverlay('clip-saved', clip.filename, clip.duration);
    }
  }, [settings.clipDuration, addClip]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      const clip: Clip = {
        id: Date.now().toString(),
        filename: `Recording_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`,
        duration: recordingTime,
        timestamp: new Date(),
        size: `${(recordingTime * 2.5).toFixed(1)} MB`,
      };
      addClip(clip);
      showOverlay('clip-saved', clip.filename, clip.duration);
      setRecordingTime(0);

      if (isElectron && (window as any).electronAPI?.stopRecording) {
        (window as any).electronAPI.stopRecording();
      }
    } else {
      setIsRecording(true);
      showOverlay('recording-started', '', 0);
      if (isElectron && (window as any).electronAPI?.startRecording) {
        (window as any).electronAPI.startRecording();
      }
    }
  }, [isRecording, recordingTime, addClip]);

  const handleOpenFolder = () => {
    if (isElectron && (window as any).electronAPI?.openClipsFolder) {
      (window as any).electronAPI.openClipsFolder();
    }
  };

  const handlePlayClip = (clip: Clip) => {
    if (isElectron && (window as any).electronAPI?.playClip) {
      (window as any).electronAPI.playClip(clip.filename);
    }
  };

  const handleDeleteClip = (clipId: string) => {
    if (isElectron && (window as any).electronAPI?.deleteClip) {
      (window as any).electronAPI.deleteClip(clipId);
    }
  };

  const handleTrimSave = (clip: Clip, startTime: number, endTime: number) => {
    console.log(`[Clips] Trim ${clip.filename}: ${startTime}s - ${endTime}s`);
    setTrimmingClip(null);
  };

  const totalSize = clips.reduce((acc, c) => {
    const match = c.size.match(/([\d.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const formatTotalSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">{t('clips.title')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground text-[11px] font-mono border border-border hover:bg-muted hover:text-foreground transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {t('clips.openFolder')}
            </button>
            <button
              onClick={handleClipNow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-[12px] font-mono border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <Scissors className="w-4 h-4" />
              {t('clips.clipLast')} {formatDuration(settings.clipDuration)}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className={`rounded-xl p-5 border transition-all ${
            isRecording
              ? 'bg-destructive/5 border-destructive/30 shadow-[0_0_20px_hsl(var(--destructive)/0.1)]'
              : 'bg-card border-border'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase">{t('clips.recording')}</p>
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[11px] font-mono text-destructive">LIVE</span>
                </div>
              )}
            </div>
            <button
              onClick={handleToggleRecording}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-mono transition-all ${
                isRecording
                  ? 'bg-destructive/15 text-destructive border border-destructive/25 hover:bg-destructive/20'
                  : 'bg-muted/50 text-foreground/70 border border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  {t('clips.stopRecording')} ({formatDuration(recordingTime)})
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  {t('clips.startRecording')}
                </>
              )}
            </button>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase">{t('clips.replayBuffer')}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDurationPicker(!showDurationPicker)}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${bufferActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                  <span className={`text-[11px] font-mono ${bufferActive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {bufferActive ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
            {showDurationPicker ? (
              <ClipDurationPicker
                value={settings.clipDuration}
                onChange={(d) => updateSettings({ clipDuration: d })}
              />
            ) : (
              <>
                <div className="flex items-center gap-2 text-foreground/60">
                  <Clock className="w-4 h-4" />
                  <span className="text-[13px]">{formatDuration(settings.clipDuration)} buffer</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">Ctrl+Shift+C</kbd>
                </p>
              </>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase mb-3">{t('clips.storage')}</p>
            <div className="flex items-center gap-2 text-foreground/60 mb-1">
              <HardDrive className="w-4 h-4" />
              <span className="text-[13px]">{clips.length} clip{clips.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">{formatTotalSize(totalSize)}</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${Math.min((totalSize / 5120) * 100, 100)}%` }} />
            </div>
            <p className="text-[9px] font-mono text-muted-foreground/50 mt-1">{formatTotalSize(totalSize)} / 5.0 GB</p>
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 truncate" title={settings.clipFolder}>{settings.clipFolder}</p>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <Film className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground/50 text-sm font-medium">{t('clips.noClips')}</p>
            <p className="text-muted-foreground font-mono text-[11px] mt-2 max-w-[300px]">
              {t('clips.noClipsHint', { wake: settings.wakeName })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/20 transition-all group cursor-pointer"
                onClick={() => setTrimmingClip(clip)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {clip.thumbnail ? (
                      <img src={clip.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Film className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground/85 truncate">{clip.filename}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(clip.duration)}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">{clip.size}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/60">{formatTime(clip.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setTrimmingClip(clip); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors">
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handlePlayClip(clip); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClip(clip.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClipOverlay
        visible={overlayVisible}
        filename={overlayFilename}
        duration={overlayDuration}
        variant={overlayVariant}
        onDismiss={() => setOverlayVisible(false)}
        lang={settings.language || 'en'}
      />

      {trimmingClip && (
        <ClipTrimmer
          clip={trimmingClip}
          onClose={() => setTrimmingClip(null)}
          onSave={handleTrimSave}
        />
      )}
    </div>
  );
};
