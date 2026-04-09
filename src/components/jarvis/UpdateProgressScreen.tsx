import { useState, useEffect } from 'react';

const DOWNLOAD_MESSAGES = [
  'Downloading update package...',
  'Downloading update package...',
  'Verifying file integrity...',
  'Extracting new modules...',
  'Applying system patches...',
];

const INSTALL_MESSAGES = [
  'Launching installer...',
  'Finalizing installation...',
];

type UpdateProgressScreenProps = {
  open: boolean;
  newVersion: string;
  downloadProgress: number; // 0-100 real progress from Electron
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

  // Smooth out the progress display
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
    if (installState === 'failed') return 'Install could not launch automatically. Please run the installer manually.';
    if (installState === 'done') return 'Update complete. Restarting...';
    if (installState === 'installing') return 'Launching installer...';
    // downloading
    const idx = Math.min(
      Math.floor((downloadProgress / 100) * DOWNLOAD_MESSAGES.length),
      DOWNLOAD_MESSAGES.length - 1
    );
    return DOWNLOAD_MESSAGES[idx];
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: '#0e1117' }}
    >
      <div className="flex flex-col items-center">
        {/* Orb */}
        <div className="relative w-[120px] h-[120px] mb-8">
          <div
            className="w-[120px] h-[120px] rounded-full"
            style={{
              background: installState === 'failed'
                ? 'radial-gradient(circle at 35% 35%, #f87171, #ef4444, #b91c1c, #7f1d1d)'
                : 'radial-gradient(circle at 35% 35%, #38bdf8, #0ea5e9, #0369a1, #0c4a6e)',
              boxShadow: installState === 'failed'
                ? '0 0 40px rgba(239,68,68,0.4), 0 0 80px rgba(239,68,68,0.2)'
                : '0 0 40px rgba(14,165,233,0.4), 0 0 80px rgba(14,165,233,0.2), inset 0 0 30px rgba(56,189,248,0.3)',
              animation: 'update-orb-pulse 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-primary/20"
            style={{ animation: 'update-ring-pulse 2s ease-in-out infinite 0.5s' }}
          />
        </div>

        {/* Title */}
        <p className="font-display text-lg tracking-[0.3em] uppercase text-primary font-semibold mb-2">
          Jarvis AI
        </p>

        {/* Status message */}
        <p
          className="text-[11px] tracking-[0.15em] uppercase font-mono transition-opacity duration-300 text-center max-w-[280px]"
          style={{ color: installState === 'failed' ? 'rgba(248,113,113,0.8)' : 'rgba(148,163,184,0.6)' }}
        >
          {getMessage()}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-[200px] h-[2px] rounded-[1px] overflow-hidden" style={{ background: 'rgba(14,165,233,0.1)' }}>
          <div
            className="h-full rounded-[1px] transition-all duration-300"
            style={{
              width: `${displayProgress}%`,
              background: installState === 'failed'
                ? 'linear-gradient(90deg, #ef4444, #ef4444aa)'
                : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
            }}
          />
        </div>

        {/* Percentage */}
        <p className="mt-3 text-[10px] font-mono text-muted-foreground/50">
          {Math.round(displayProgress)}%
        </p>

        {/* Failure actions */}
        {installState === 'failed' && (
          <div className="mt-6 flex gap-3">
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="text-[11px] font-mono px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 transition-colors"
              >
                Open Download Folder
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-[11px] font-mono px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg border border-border transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}

        {/* Version badge */}
        <p
          className="fixed bottom-3 right-4 text-[10px] tracking-[0.1em] font-mono"
          style={{ color: 'rgba(148,163,184,0.3)' }}
        >
          v{newVersion}
        </p>
      </div>

      <style>{`
        @keyframes update-orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes update-ring-pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
