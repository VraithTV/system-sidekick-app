const STORAGE_KEY = 'jarvis-memories';

export interface MemoryFact {
  id: string;
  fact: string;
  createdAt: string;
}

export function getMemories(): MemoryFact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMemories(memories: MemoryFact[]) {
  // Keep max 100 facts
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories.slice(0, 100)));
}

export function addMemories(newFacts: string[]) {
  const existing = getMemories();
  const now = new Date().toISOString();
  const toAdd = newFacts
    .filter((f) => f.trim().length > 0)
    .filter((f) => !existing.some((e) => e.fact.toLowerCase() === f.toLowerCase()))
    .map((fact) => ({ id: crypto.randomUUID(), fact, createdAt: now }));
  if (toAdd.length > 0) {
    saveMemories([...toAdd, ...existing]);
  }
}

export function clearMemories() {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatMemoriesForPrompt(): string {
  const memories = getMemories();
  if (memories.length === 0) return '';
  return memories.map((m) => `- ${m.fact}`).join('\n');
}
