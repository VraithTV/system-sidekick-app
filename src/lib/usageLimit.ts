const USAGE_KEY = 'jarvis_daily_usage';
const LIMIT_KEY = 'jarvis_daily_limit';
const DEFAULT_LIMIT = 25;

interface DailyUsage {
  date: string; // YYYY-MM-DD
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
    // Reset if it's a new day
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
  try {
    const val = localStorage.getItem(LIMIT_KEY);
    return val ? parseInt(val, 10) : DEFAULT_LIMIT;
  } catch {
    return DEFAULT_LIMIT;
  }
}

export function setDailyLimit(limit: number): void {
  try {
    localStorage.setItem(LIMIT_KEY, String(limit));
  } catch {}
}

export function getUsageCount(): number {
  return getUsage().count;
}

export function getRemainingUses(): number {
  return Math.max(0, getDailyLimit() - getUsage().count);
}

export function canUseVoice(): boolean {
  return getUsage().count < getDailyLimit();
}

export function incrementUsage(): void {
  const usage = getUsage();
  usage.count += 1;
  saveUsage(usage);
}
