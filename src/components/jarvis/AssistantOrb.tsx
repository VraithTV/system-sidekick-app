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
      {/* Orb container */}
      <div className="relative">
        {/* Outer rings - much more visible */}
        <div className="absolute inset-[-30px] rounded-full border border-primary/20 animate-ring-rotate" />
        <div className="absolute inset-[-48px] rounded-full border border-primary/10 animate-ring-rotate-reverse" />
        <div className="absolute inset-[-64px] rounded-full border border-primary/[0.06] animate-ring-pulse" />

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
            <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-px h-2 bg-primary/25" />
          </div>
        ))}

        {/* Orb */}
        <div
          className={`relative w-32 h-32 rounded-full ${stateAnimations[state]} flex items-center justify-center`}
          style={{
            background: `radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.08) 60%, hsl(var(--background)) 100%)`,
            boxShadow: `0 0 60px hsl(var(--primary) / 0.2), 0 0 120px hsl(var(--primary) / 0.08)`,
          }}
        >
          {/* Inner glass border */}
          <div className="absolute inset-[3px] rounded-full border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.03]" />

          {/* Core glow - brighter */}
          <div
            className="relative w-14 h-14 rounded-full transition-all duration-700"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.15) 60%, transparent 100%)`,
              boxShadow: `0 0 40px hsl(var(--primary) / 0.3), 0 0 80px hsl(var(--primary) / 0.1)`,
            }}
          />

          {/* Scanning line */}
          {(state === 'listening' || state === 'thinking') && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                style={{
                  animation: 'scan-line 2s ease-in-out infinite',
                  top: '0',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Waveform - more visible */}
      <div className="flex items-center gap-[3px] h-7">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-[2px] rounded-full transition-all duration-100 ${
              state === 'listening' || state === 'speaking'
                ? 'bg-primary'
                : state === 'thinking'
                ? 'bg-primary/50'
                : 'bg-primary/25'
            }`}
            style={{
              height: state === 'listening' || state === 'speaking'
                ? `${Math.random() * 20 + 4}px`
                : state === 'thinking'
                ? `${Math.sin(i * 0.5) * 8 + 6}px`
                : '4px',
              animation: (state === 'listening' || state === 'speaking')
                ? `waveform ${0.25 + Math.random() * 0.35}s ease-in-out infinite alternate`
                : 'none',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      {/* Status label */}
      <span className="font-display text-[11px] tracking-[0.3em] text-primary glow-text">
        {stateLabels[state]}
      </span>
    </div>
  );
};
