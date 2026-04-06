import { useEffect, useState } from 'react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';
import { CloseActionPrompt } from './CloseActionPrompt';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export const TitleBar = () => {
  const [maximized, setMaximized] = useState(false);
  const [showClosePrompt, setShowClosePrompt] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    api.isMaximized().then(setMaximized);
    api.onMaximizedChange(setMaximized);
  }, []);

  const api = isElectron ? (window as any).electronAPI : null;

  const runCloseAction = (action: 'tray' | 'quit') => {
    setShowClosePrompt(false);

    window.setTimeout(() => {
      if (action === 'tray') {
        api?.hideToTray?.();
        return;
      }

      api?.quit?.();
    }, 0);
  };

  const handleKeepRunningInTray = () => {
    runCloseAction('tray');
  };

  const handleQuitCompletely = () => {
    runCloseAction('quit');
  };

  return (
    <>
      <div className="titlebar-drag flex items-center justify-end h-9 bg-card border-b border-border/40 px-3 shrink-0 select-none z-50">
        {isElectron && api && (
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
              {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowClosePrompt(true)}
              className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <CloseActionPrompt
        open={isElectron && showClosePrompt}
        onDismiss={() => setShowClosePrompt(false)}
        onKeepRunning={handleKeepRunningInTray}
        onQuit={handleQuitCompletely}
      />
    </>
  );
};