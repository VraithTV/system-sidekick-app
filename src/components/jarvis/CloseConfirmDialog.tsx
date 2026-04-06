import { useCloseConfirmation } from '@/hooks/useCloseConfirmation';

export const CloseConfirmDialog = () => {
  const { showDialog, minimizeToTray, quitApp, cancel } = useCloseConfirmation();

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
        <h3 className="font-display text-base tracking-[0.1em] text-foreground mb-2">
          Close Jarvis?
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Would you like to minimize Jarvis to the system tray or exit completely?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={minimizeToTray}
            className="w-full py-2.5 rounded-lg border border-primary/30 text-primary font-display text-xs tracking-[0.12em] uppercase hover:bg-primary/10 transition-all"
          >
            Minimize to Tray
          </button>
          <button
            onClick={quitApp}
            className="w-full py-2.5 rounded-lg border border-destructive/30 text-destructive/80 font-display text-xs tracking-[0.12em] uppercase hover:bg-destructive/10 transition-all"
          >
            Exit Jarvis
          </button>
          <button
            onClick={cancel}
            className="w-full py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
