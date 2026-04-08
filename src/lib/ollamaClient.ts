/**
 * Ollama local AI client.
 * Talks to Ollama running at localhost:11434.
 * Used when available (typically in Electron desktop mode) for free, private, offline AI.
 */

const OLLAMA_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

let _ollamaAvailable: boolean | null = null;
let _ollamaModel: string | null = null;

/** Check if Ollama is running locally */
export async function isOllamaAvailable(): Promise<boolean> {
  if (_ollamaAvailable !== null) return _ollamaAvailable;
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) { _ollamaAvailable = false; return false; }
    const data = await res.json();
    const models: { name: string }[] = data?.models || [];
    // Pick the best available model
    const preferred = ['llama3.1', 'llama3', 'llama3:8b', 'mistral', 'gemma2'];
    _ollamaModel = preferred.find(p => models.some(m => m.name.startsWith(p)))
      || models[0]?.name
      || null;
    _ollamaAvailable = !!_ollamaModel;
    console.log('[Ollama] Available:', _ollamaAvailable, 'Model:', _ollamaModel);
    return _ollamaAvailable;
  } catch {
    _ollamaAvailable = false;
    return false;
  }
}

/** Force re-check on next call */
export function resetOllamaStatus() {
  _ollamaAvailable = null;
  _ollamaModel = null;
}

/** Get the detected model name */
export function getOllamaModel(): string {
  return _ollamaModel || DEFAULT_MODEL;
}

/** List available Ollama models */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}

export interface OllamaChatOptions {
  model?: string;
  systemPrompt: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

/** Send a chat completion request to local Ollama */
export async function chatWithOllama(options: OllamaChatOptions): Promise<string> {
  const model = options.model || _ollamaModel || DEFAULT_MODEL;

  const messages = [
    { role: 'system' as const, content: options.systemPrompt },
    ...options.messages,
  ];

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 256, // Keep responses concise for voice
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data?.message?.content || "I didn't catch that. Could you say it again?";
}
