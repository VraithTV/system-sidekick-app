import { useJarvisStore } from '@/store/jarvisStore';

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
      <div className="relative">
        {/* Outer rings */}
        <div className="absolute inset-[-32px] rounded-full border-2 border-primary/25 animate-ring-rotate" />
        <div className="absolute inset-[-50px] rounded-full border border-primary/15 animate-ring-rotate-reverse" />
        <div className="absolute inset-[-66px] rounded-full border border-primary/8 animate-ring-pulse" />

        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full animate-ring-rotate"
            style={{ transform: `rotate(${i * 15}deg)`, animationDuration: '20s' }}
          >
            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-[1.5px] h-2 bg-primary/30" />
          </div>
        ))}

        {/* Main orb */}
        <div
          className={`relative w-40 h-40 rounded-full ${stateAnimations[state]} flex items-center justify-center`}
          style={{
            background: `radial-gradient(circle at 38% 32%, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.12) 55%, hsl(var(--background)) 100%)`,
            boxShadow: `0 0 80px hsl(var(--primary) / 0.25), 0 0 160px hsl(var(--primary) / 0.08)`,
          }}
        >
          <div className="absolute inset-[3px] rounded-full border-2 border-primary/15" />
          <div className="absolute inset-4 rounded-full border border-primary/8 bg-background/30" />

          {/* Core */}
          <div
            className="relative w-[72px] h-[72px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.2) 58%, transparent 100%)',
              boxShadow: '0 0 50px hsl(var(--primary) / 0.35), 0 0 100px hsl(var(--primary) / 0.12)',
            }}
          />

          {(state === 'listening' || state === 'thinking') && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                style={{ animation: 'ring-pulse 1.8s ease-in-out infinite', top: '50%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Waveform dots */}
      <div className="flex items-end gap-[4px] h-6 mt-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full ${
              state === 'listening' || state === 'speaking' ? 'bg-primary' : 'bg-primary/40'
            }`}
            style={{
              height: state === 'listening' || state === 'speaking'
                ? `${Math.random() * 18 + 6}px` : '6px',
              animation: state === 'listening' || state === 'speaking'
                ? `waveform ${0.3 + Math.random() * 0.25}s ease-in-out infinite alternate` : 'none',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      <span className="font-display text-sm font-semibold tracking-[0.35em] text-primary glow-text">
        {stateLabels[state]}
      </span>
    </div>
  );
};
