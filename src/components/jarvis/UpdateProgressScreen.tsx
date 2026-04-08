import { useState, useEffect } from 'react';

const UPDATE_MESSAGES = [
  'Downloading update package...',
  'Verifying file integrity...',
  'Extracting new modules...',
  'Applying system patches...',
  'Updating core components...',
  'Rebuilding configuration...',
  'Syncing preferences...',
  'Finalizing installation...',
  'Cleaning up temporary files...',
  'Restarting subsystems...',
];

type UpdateProgressScreenProps = {
  open: boolean;
  newVersion: string;
  onComplete: () => void;
};

export const UpdateProgressScreen = ({ open, newVersion, onComplete }: UpdateProgressScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setMessageIndex(0);
      setDone(false);
      return;
    }

    // Simulate progress over ~8 seconds
    const totalDuration = 8000;
    const interval = 80;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setDone(true);
        setTimeout(onComplete, 1500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [open, onComplete]);

  // Rotate messages based on progress
  useEffect(() => {
    if (!open) return;
    const idx = Math.min(
      Math.floor((progress / 100) * UPDATE_MESSAGES.length),
      UPDATE_MESSAGES.length - 1
    );
    setMessageIndex(idx);
  }, [progress, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: '#0e1117' }}
    >
      {/* Orb */}
      <div className="flex flex-col items-center">
        <div className="relative w-[120px] h-[120px] mb-8">
          <div
            className="w-[120px] h-[120px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #38bdf8, #0ea5e9, #0369a1, #0c4a6e)',
              boxShadow: '0 0 40px rgba(14,165,233,0.4), 0 0 80px rgba(14,165,233,0.2), inset 0 0 30px rgba(56,189,248,0.3)',
              animation: 'update-orb-pulse 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-primary/20"
            style={{ animation: 'update-ring-pulse 2s ease-in-out infinite 0.5s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full border border-primary/20"
            style={{ animation: 'update-ring-pulse 2s ease-in-out infinite 1s' }}
          />
        </div>

        {/* Title */}
        <p
          className="font-display text-lg tracking-[0.3em] uppercase text-primary font-semibold mb-2"
        >
          Jarvis AI
        </p>

        {/* Status message */}
        <p
          className="text-[11px] tracking-[0.15em] uppercase font-mono transition-opacity duration-300"
          style={{ color: 'rgba(148,163,184,0.6)' }}
        >
          {done ? 'Update complete. Restarting...' : UPDATE_MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-[200px] h-[2px] rounded-[1px] overflow-hidden" style={{ background: 'rgba(14,165,233,0.1)' }}>
          <div
            className="h-full rounded-[1px] transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
            }}
          />
        </div>

        {/* Percentage */}
        <p className="mt-3 text-[10px] font-mono text-muted-foreground/50">
          {Math.round(progress)}%
        </p>

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
