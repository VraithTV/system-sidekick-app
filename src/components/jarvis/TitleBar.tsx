import { useState, useEffect } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { JarvisLogo } from './JarvisLogo';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const TitleBar = () => {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    api.isMaximized().then(setMaximized);
    api.onMaximizedChange(setMaximized);
  }, []);

  if (!isElectron) return null;

  const api = (window as any).electronAPI;

  return (
    <div className="titlebar-drag flex items-center justify-between h-9 bg-card border-b border-border/40 px-3 shrink-0 select-none z-50">
      {/* Left — branding */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        <JarvisLogo size={14} className="text-primary" />
        <span className="text-[10px] font-display tracking-[0.12em] text-foreground/60">
          Jarvis AI <span className="text-primary/70 font-semibold">BETA</span>
        </span>
      </div>

      {/* Right — window controls */}
      <div className="flex items-center gap-px titlebar-no-drag">
        <button
          onClick={() => api.minimize()}
          className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => api.maximize()}
          className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded transition-colors"
        >
          <JarvisLogo size={12} className="text-primary" />
        </button>
        <button
          onClick={() => api.close()}
          className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};