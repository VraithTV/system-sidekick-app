import { useState, useEffect } from 'react';
import { Circle, Check } from 'lucide-react';
import { JarvisLogo } from '@/components/jarvis/JarvisLogo';

type ClipOverlayProps = {
  visible: boolean;
  filename: string;
  duration: number;
  variant?: 'recording-started' | 'clip-saved';
  onDismiss: () => void;
};

const titles: Record<string, { title: string; subtitle: string }> = {
  'recording-started': { title: 'Recording started!', subtitle: 'Your gameplay is being recorded' },
  'clip-saved': { title: 'Clip Saved!', subtitle: 'Finished recording your gameplay' },
};

export const ClipOverlay = ({ visible, filename, duration, variant = 'clip-saved', onDismiss }: ClipOverlayProps) => {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit' | 'hidden'>('hidden');

  useEffect(() => {
    if (visible) {
      setPhase('enter');
      const showTimer = setTimeout(() => setPhase('show'), 50);
      const exitTimer = setTimeout(() => setPhase('exit'), 3500);
      const hideTimer = setTimeout(() => {
        setPhase('hidden');
        onDismiss();
      }, 4000);
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

  const info = titles[variant];
  const isRecording = variant === 'recording-started';

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-[#1a1d23]/95 backdrop-blur-md pl-3 pr-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out ${
        phase === 'enter' ? 'translate-y-[-20px] opacity-0 scale-95' :
        phase === 'exit' ? 'translate-y-[-10px] opacity-0 scale-95' :
        'translate-y-0 opacity-100 scale-100'
      }`}
    >
      {/* Logo - matches Medal's "M" icon */}
      <JarvisLogo size={28} />

      {/* Status icon */}
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isRecording ? 'bg-emerald-500/20' : 'bg-emerald-500/20'
      }`}>
        {isRecording ? (
          <Circle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
        ) : (
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-white/95 leading-tight">
          {info.title}
        </p>
        <p className="text-[11px] text-white/50 leading-tight mt-0.5">
          {info.subtitle}
        </p>
      </div>
    </div>
  );
};
