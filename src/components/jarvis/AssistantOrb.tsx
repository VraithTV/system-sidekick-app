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
      <div className="relative flex h-[240px] w-[240px] items-center justify-center rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_hsl(var(--background)/0.55)]">
        <div className="absolute inset-4 rounded-[1.5rem] border border-primary/10 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="absolute inset-[42px] rounded-full border border-primary/30 animate-ring-rotate" />
        <div className="absolute inset-[28px] rounded-full border border-primary/15 animate-ring-rotate-reverse" />
        <div className="absolute inset-[12px] rounded-full border border-primary/10 animate-ring-pulse" />

        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-[164px] w-[164px]"
            style={{ transform: `rotate(${i * 18}deg)` }}
          >
            <div className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-primary/40" />
          </div>
        ))}

        <div className="relative flex h-[152px] w-[152px] items-center justify-center rounded-full border border-primary/20 bg-[radial-gradient(circle_at_35%_30%,hsl(var(--primary)/0.35),hsl(var(--primary)/0.1)_55%,transparent_78%)] shadow-[0_0_65px_hsl(var(--primary)/0.18)]">
          <div className="absolute inset-3 rounded-full border border-primary/10 bg-background/40" />
          <div
            className={`relative h-[76px] w-[76px] rounded-full ${stateAnimations[state]}`}
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.22) 58%, transparent 100%)',
              boxShadow: '0 0 55px hsl(var(--primary) / 0.42), 0 0 120px hsl(var(--primary) / 0.18)',
            }}
          />

          {(state === 'listening' || state === 'thinking') && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ animation: 'ring-pulse 1.8s ease-in-out infinite', top: '50%' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-[4px] h-8">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-100 ${
              state === 'listening' || state === 'speaking'
                ? 'bg-primary'
                : state === 'thinking'
                  ? 'bg-primary/70'
                  : 'bg-primary/45'
            }`}
            style={{
              height:
                state === 'listening' || state === 'speaking'
                  ? `${Math.random() * 22 + 8}px`
                  : state === 'thinking'
                    ? `${Math.sin(i * 0.55) * 9 + 12}px`
                    : '8px',
              animation:
                state === 'listening' || state === 'speaking'
                  ? `waveform ${0.3 + Math.random() * 0.25}s ease-in-out infinite alternate`
                  : 'none',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      <span className="font-display text-xs font-semibold tracking-[0.32em] text-primary glow-text">
        {stateLabels[state]}
      </span>
    </div>
  );
};
