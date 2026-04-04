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
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Outer rings */}
        <div className="absolute inset-[-32px] rounded-full border-2 border-primary/30 animate-ring-rotate" />
        <div className="absolute inset-[-50px] rounded-full border border-primary/20 animate-ring-rotate-reverse" />
        <div className="absolute inset-[-66px] rounded-full border border-primary/10 animate-ring-pulse" />

        {/* Ring tick marks */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full animate-ring-rotate"
            style={{ transform: `rotate(${i * 15}deg)`, animationDuration: '20s' }}
          >
            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-[1.5px] h-2 bg-primary/35" />
          </div>
        ))}

        {/* Orb */}
        <div
          className={`relative w-36 h-36 rounded-full ${stateAnimations[state]} flex items-center justify-center`}
          style={{
            background: `radial-gradient(circle at 38% 32%, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.15) 55%, hsl(var(--card)) 100%)`,
            boxShadow: `0 0 80px hsl(var(--primary) / 0.3), 0 0 160px hsl(var(--primary) / 0.12)`,
          }}
        >
          <div className="absolute inset-[3px] rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />

          {/* Core glow */}
          <div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.25) 55%, transparent 100%)`,
              boxShadow: `0 0 50px hsl(var(--primary) / 0.45), 0 0 100px hsl(var(--primary) / 0.15)`,
            }}
          />

          {(state === 'listening' || state === 'thinking') && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                style={{ animation: 'scan-line 2s ease-in-out infinite', top: '0' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-[3px] h-8 mt-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-100 ${
              state === 'listening' || state === 'speaking' ? 'bg-primary' : state === 'thinking' ? 'bg-primary/60' : 'bg-primary/35'
            }`}
            style={{
              height: state === 'listening' || state === 'speaking'
                ? `${Math.random() * 24 + 5}px`
                : state === 'thinking' ? `${Math.sin(i * 0.5) * 10 + 8}px` : '5px',
              animation: (state === 'listening' || state === 'speaking')
                ? `waveform ${0.25 + Math.random() * 0.35}s ease-in-out infinite alternate` : 'none',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      {/* Label */}
      <span className="font-display text-xs tracking-[0.3em] text-primary glow-text font-semibold">
        {stateLabels[state]}
      </span>
    </div>
  );
};
