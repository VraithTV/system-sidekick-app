const USAGE_KEY = 'jarvis_daily_usage';
const DAILY_LIMIT = 25;

interface DailyUsage {
  date: string;
  count: number;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): DailyUsage {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { date: getTodayStr(), count: 0 };
    const parsed: DailyUsage = JSON.parse(raw);
    if (parsed.date !== getTodayStr()) {
      return { date: getTodayStr(), count: 0 };
    }
    return parsed;
  } catch {
    return { date: getTodayStr(), count: 0 };
  }
}

function saveUsage(usage: DailyUsage): void {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {}
}

export function getDailyLimit(): number {
  return DAILY_LIMIT;
}

export function getUsageCount(): number {
  return getUsage().count;
}

export function getRemainingUses(): number {
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

export function canUseVoice(): boolean {
  return getUsage().count < DAILY_LIMIT;
}

export function incrementUsage(): void {
  const usage = getUsage();
  usage.count += 1;
  saveUsage(usage);
}
