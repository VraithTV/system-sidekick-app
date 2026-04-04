import { useState, useEffect } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const WindowControls = () => {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    api.isMaximized().then(setMaximized);
    api.onMaximizedChange(setMaximized);
  }, []);

  const api = isElectron ? (window as any).electronAPI : null;

  if (!isElectron || !api) return null;

  return (
    <div className="absolute top-2 right-3 z-50 flex items-center gap-1 titlebar-no-drag">
      <button
        onClick={() => api.minimize()}
        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => api.maximize()}
        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded transition-colors"
      >
        <Maximize2 className="w-3 h-3" />
      </button>
      <button
        onClick={() => api.close()}
        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
