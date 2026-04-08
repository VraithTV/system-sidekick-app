type UpdatePromptProps = {
  open: boolean;
  currentVersion: string;
  newVersion: string;
  onDismiss: () => void;
  onUpdateNow: () => void;
  onUpdateLater: () => void;
};

export const UpdatePrompt = ({
  open,
  currentVersion,
  newVersion,
  onDismiss,
  onUpdateNow,
  onUpdateLater,
}: UpdatePromptProps) => {
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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-sm uppercase tracking-[0.16em] text-foreground/90">
          Update Available
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A new version of Jarvis AI has been identified.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-muted border border-border">v{currentVersion}</span>
          <span className="text-primary">→</span>
          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">v{newVersion}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Would you like to update now or later?
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onUpdateLater}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Update Later
          </button>
          <button
            onClick={onUpdateNow}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
};
