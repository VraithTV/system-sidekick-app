import { useState, useEffect } from 'react';
import { JarvisLogo } from './JarvisLogo';

const DOWNLOAD_MESSAGES = [
  'Downloading update...',
  'Downloading update...',
  'Verifying integrity...',
  'Extracting modules...',
  'Applying patches...',
];

type UpdateProgressScreenProps = {
  open: boolean;
  newVersion: string;
  downloadProgress: number;
  installState: 'downloading' | 'installing' | 'failed' | 'done';
  onOpenFolder?: () => void;
  onDismiss?: () => void;
};

export const UpdateProgressScreen = ({
  open,
  newVersion,
  downloadProgress,
  installState,
  onOpenFolder,
  onDismiss,
}: UpdateProgressScreenProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!open) { setDisplayProgress(0); return; }
    if (installState === 'installing' || installState === 'done') {
      setDisplayProgress(100);
    } else {
      setDisplayProgress(downloadProgress);
    }
  }, [open, downloadProgress, installState]);

  if (!open) return null;

  const getMessage = () => {
    if (installState === 'failed') return 'Install could not launch. Please run the installer manually.';
    if (installState === 'done') return 'Update complete. Restarting...';
    if (installState === 'installing') return 'Launching installer...';
    const idx = Math.min(
      Math.floor((downloadProgress / 100) * DOWNLOAD_MESSAGES.length),
      DOWNLOAD_MESSAGES.length - 1
    );
    return DOWNLOAD_MESSAGES[idx];
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        {/* Reuse the Jarvis logo orb */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)] scale-[3]" />
          <JarvisLogo size={80} className="text-primary" static={false} />
        </div>

        {/* Title */}
        <p className="font-display text-sm tracking-[0.3em] uppercase text-primary/70 mb-1">
          Updating Jarvis
        </p>

        {/* Status */}
        <p
          className="text-[10px] tracking-[0.12em] uppercase font-mono mb-6 text-center max-w-[260px]"
          style={{ color: installState === 'failed' ? 'hsl(0 84% 60%)' : 'hsl(var(--muted-foreground) / 0.5)' }}
        >
          {getMessage()}
        </p>

        {/* Progress bar - same minimal style as splash */}
        <div className="w-[180px] h-[2px] rounded-full overflow-hidden bg-primary/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${displayProgress}%`,
              background: installState === 'failed'
                ? 'hsl(0 84% 60%)'
                : 'hsl(var(--primary))',
            }}
          />
        </div>

        <p className="mt-2 text-[9px] font-mono text-muted-foreground/30">
          {Math.round(displayProgress)}%
        </p>

        {/* Failure actions */}
        {installState === 'failed' && (
          <div className="mt-5 flex gap-3">
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="text-[10px] font-mono px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 transition-colors"
              >
                Open Folder
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-[10px] font-mono px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg border border-border transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}

        {/* Version */}
        <p className="fixed bottom-3 right-4 text-[9px] tracking-[0.1em] font-mono text-muted-foreground/20">
          v{newVersion}
        </p>
      </div>
    </div>
  );
};
