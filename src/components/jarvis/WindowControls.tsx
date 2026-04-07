import { useState, useEffect } from 'react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';

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

  return (
    <div className="h-9 shrink-0 flex items-center justify-end titlebar-drag bg-background border-b border-border/20">
      {isElectron && api && (
        <div className="flex items-center gap-px pr-2 titlebar-no-drag">
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
            {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => api.quit?.()}
            className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
