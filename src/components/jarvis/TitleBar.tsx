import { useState, useEffect } from 'react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';

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

  const handleKeepRunningInTray = () => {
    setShowClosePrompt(false);
    api?.hideToTray?.();
  };

  const handleQuitCompletely = () => {
    setShowClosePrompt(false);
    api?.quit?.();
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

      {isElectron && showClosePrompt && (
        <div
          className="titlebar-no-drag fixed inset-0 z-[70] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          onClick={() => setShowClosePrompt(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card/95 p-5 text-left shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-display text-sm uppercase tracking-[0.16em] text-foreground/90">
              Close Jarvis
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Keep Jarvis running in the background from your system tray, or quit the app completely.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={handleKeepRunningInTray}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Keep Running in Tray
              </button>
              <button
                onClick={handleQuitCompletely}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Quit Completely
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};