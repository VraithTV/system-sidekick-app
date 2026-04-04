import { Construction } from 'lucide-react';

export const ComingSoonOverlay = ({ title }: { title: string }) => (
  <div className="flex-1 relative overflow-hidden bg-background">
    {/* Blurred placeholder content */}
    <div className="p-8 blur-sm opacity-30 pointer-events-none select-none">
      <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">{title}</h2>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border h-24" />
        ))}
      </div>
    </div>

    {/* Overlay */}
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-5">
          <Construction className="w-7 h-7 text-primary/50" />
        </div>
        <h3 className="font-display text-base tracking-[0.12em] text-foreground/70 mb-2">
          Under Development
        </h3>
        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
          This feature is still being built. Stay tuned for updates.
        </p>
        <span className="mt-4 text-[9px] font-mono text-primary/40 tracking-widest uppercase">Coming Soon</span>
      </div>
    </div>
  </div>
);
