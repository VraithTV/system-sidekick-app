import { useState, useEffect } from 'react';
import { Scissors, Check } from 'lucide-react';

type ClipOverlayProps = {
  visible: boolean;
  filename: string;
  duration: number;
  onDismiss: () => void;
};

export const ClipOverlay = ({ visible, filename, duration, onDismiss }: ClipOverlayProps) => {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit' | 'hidden'>('hidden');

  useEffect(() => {
    if (visible) {
      setPhase('enter');
      const showTimer = setTimeout(() => setPhase('show'), 50);
      const exitTimer = setTimeout(() => setPhase('exit'), 3000);
      const hideTimer = setTimeout(() => {
        setPhase('hidden');
        onDismiss();
      }, 3500);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setPhase('hidden');
    }
  }, [visible, onDismiss]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md px-4 py-3 shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300 ${
        phase === 'enter' ? 'translate-x-[120%] opacity-0' :
        phase === 'exit' ? 'translate-x-[120%] opacity-0' :
        'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15 border border-primary/20">
        <Check className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-foreground/90 flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-primary" />
          Clip Saved
        </p>
        <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
          {filename}
        </p>
        <p className="text-[9px] font-mono text-muted-foreground/60">{duration}s captured</p>
      </div>
      <div className="w-1 h-8 rounded-full bg-primary/20 overflow-hidden ml-2">
        <div
          className="w-full bg-primary rounded-full animate-shrink-bar"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};
