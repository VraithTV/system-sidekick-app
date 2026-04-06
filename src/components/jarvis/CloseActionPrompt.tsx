type CloseActionPromptProps = {
  open: boolean;
  onDismiss: () => void;
  onKeepRunning: () => void;
  onQuit: () => void;
};

export const CloseActionPrompt = ({
  open,
  onDismiss,
  onKeepRunning,
  onQuit,
}: CloseActionPromptProps) => {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="titlebar-no-drag fixed inset-0 z-[70] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
      onClick={onDismiss}
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
            onClick={onKeepRunning}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Keep Running in Tray
          </button>
          <button
            onClick={onQuit}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Quit Completely
          </button>
        </div>
      </div>
    </div>
  );
};