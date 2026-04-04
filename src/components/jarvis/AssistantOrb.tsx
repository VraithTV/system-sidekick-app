import { useJarvisStore } from '@/store/jarvisStore';

const stateColors: Record<string, string> = {
  idle: 'from-primary/40 to-primary/10',
  listening: 'from-success/50 to-success/10',
  thinking: 'from-[hsl(260,60%,55%)]/50 to-primary/20',
  speaking: 'from-primary/60 to-primary/20',
  executing: 'from-warning/50 to-warning/10',
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
    <div className="flex flex-col items-center gap-6">
      {/* Outer ring */}
      <div className="relative">
        <div className="absolute inset-[-20px] rounded-full border border-primary/20 animate-ring-rotate" />
        <div className="absolute inset-[-35px] rounded-full border border-primary/10 animate-ring-rotate-reverse" />
        
        {/* Orb */}
        <div
          className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${stateColors[state]} ${stateAnimations[state]} transition-all duration-500 flex items-center justify-center`}
        >
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-background/80 to-background/40" />
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${stateColors[state]} opacity-80`} />
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-1 h-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              state === 'listening' || state === 'speaking'
                ? 'bg-primary'
                : 'bg-muted-foreground/30'
            }`}
            style={{
              height: state === 'listening' || state === 'speaking'
                ? `${Math.random() * 24 + 4}px`
                : '4px',
              animation: (state === 'listening' || state === 'speaking')
                ? `waveform ${0.3 + Math.random() * 0.4}s ease-in-out infinite alternate`
                : 'none',
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Status */}
      <span className="font-display text-xs tracking-[0.3em] text-primary glow-text">
        {stateLabels[state]}
      </span>
    </div>
  );
};
