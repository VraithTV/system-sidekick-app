import { useJarvisStore } from '@/store/jarvisStore';

const stateColors: Record<string, string> = {
  idle: 'from-primary/30 via-primary/10 to-transparent',
  listening: 'from-success/40 via-success/15 to-transparent',
  thinking: 'from-[hsl(260,60%,55%)]/40 via-primary/15 to-transparent',
  speaking: 'from-primary/50 via-primary/20 to-transparent',
  executing: 'from-warning/40 via-warning/15 to-transparent',
};

const stateAnimations: Record<string, string> = {
  idle: 'animate-orb-idle',
  listening: 'animate-orb-listening',
  thinking: 'animate-orb-thinking',
  speaking: 'animate-orb-speaking',
  executing: 'animate-orb-pulse',
};

const stateLabels: Record<string, string> = {
  idle: 'STANDBY',
  listening: 'LISTENING',
  thinking: 'PROCESSING',
  speaking: 'RESPONDING',
  executing: 'EXECUTING',
};

export const AssistantOrb = () => {
  const { state } = useJarvisStore();

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Orb container */}
      <div className="relative">
        {/* Outer rings */}
        <div className="absolute inset-[-28px] rounded-full border border-primary/[0.06] animate-ring-rotate" />
        <div className="absolute inset-[-44px] rounded-full border border-primary/[0.04] animate-ring-rotate-reverse" />
        <div className="absolute inset-[-60px] rounded-full border border-primary/[0.02] animate-ring-pulse" />

        {/* Ring tick marks */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full animate-ring-rotate"
            style={{
              transform: `rotate(${i * 15}deg)`,
              animationDuration: '20s',
            }}
          >
            <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 w-px h-1.5 bg-primary/10" />
          </div>
        ))}

        {/* Orb */}
        <div
          className={`relative w-28 h-28 rounded-full bg-gradient-radial ${stateColors[state]} ${stateAnimations[state]} flex items-center justify-center`}
          style={{ background: `radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.15), hsl(var(--background)) 70%)` }}
        >
          {/* Inner glass */}
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-background/90 via-background/70 to-background/90 border border-primary/[0.08]" />

          {/* Core glow */}
          <div
            className={`relative w-12 h-12 rounded-full transition-all duration-700`}
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.05) 70%)`,
              boxShadow: `0 0 30px hsl(var(--primary) / 0.15)`,
            }}
          />

          {/* Scanning line */}
          {(state === 'listening' || state === 'thinking') && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                style={{
                  animation: 'scan-line 2s ease-in-out infinite',
                  top: '0',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-[3px] h-6">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-[2px] rounded-full transition-all duration-100 ${
              state === 'listening' || state === 'speaking'
                ? 'bg-primary/70'
                : state === 'thinking'
                ? 'bg-[hsl(260,60%,55%)]/40'
                : 'bg-muted-foreground/15'
            }`}
            style={{
              height: state === 'listening' || state === 'speaking'
                ? `${Math.random() * 20 + 3}px`
                : state === 'thinking'
                ? `${Math.sin(i * 0.5) * 8 + 6}px`
                : '3px',
              animation: (state === 'listening' || state === 'speaking')
                ? `waveform ${0.25 + Math.random() * 0.35}s ease-in-out infinite alternate`
                : 'none',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      {/* Status label */}
      <span className="font-display text-[10px] tracking-[0.35em] text-primary/70 glow-text">
        {stateLabels[state]}
      </span>
    </div>
  );
};
