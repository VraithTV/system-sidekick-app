import { useState, useEffect } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

const CLOSE_PREF_KEY = 'jarvis_close_action';

const CloseModal = ({ onChoice }: { onChoice: (action: 'tray' | 'quit', remember: boolean) => void }) => {
  const [remember, setRemember] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-[360px] shadow-2xl">
        <h3 className="text-sm font-display text-foreground mb-2">Close Jarvis</h3>
        <p className="text-[11px] text-muted-foreground font-mono mb-5">
          Would you like to minimize to the system tray or fully exit?
        </p>
        <div className="flex flex-col gap-2 mb-5">
          <button
            onClick={() => onChoice('tray', remember)}
            className="w-full py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[12px] font-mono text-primary hover:bg-primary/15 transition-colors"
          >
            Minimize to Tray
          </button>
          <button
            onClick={() => onChoice('quit', remember)}
            className="w-full py-2.5 rounded-lg bg-muted/50 border border-border text-[12px] font-mono text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
          >
            Quit Jarvis
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-border accent-primary"
          />
          <span className="text-[10px] text-muted-foreground font-mono">Remember my choice</span>
        </label>
      </div>
    </div>
  );
};

export const WindowControls = () => {
  const [maximized, setMaximized] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    api.isMaximized().then(setMaximized);
    api.onMaximizedChange(setMaximized);
  }, []);

  const api = isElectron ? (window as any).electronAPI : null;

  const handleClose = () => {
    if (!api) return;
    const saved = localStorage.getItem(CLOSE_PREF_KEY);
    if (saved === 'tray') {
      api.hideToTray();
    } else if (saved === 'quit') {
      api.quit();
    } else {
      setShowCloseModal(true);
    }
  };

  const handleChoice = (action: 'tray' | 'quit', remember: boolean) => {
    if (remember) {
      localStorage.setItem(CLOSE_PREF_KEY, action);
    }
    setShowCloseModal(false);
    if (action === 'tray') {
      api?.hideToTray();
    } else {
      api?.quit();
    }
  };

  return (
    <>
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
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {showCloseModal && <CloseModal onChoice={handleChoice} />}
    </>
  );
};
