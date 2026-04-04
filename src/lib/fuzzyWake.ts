/**
 * Levenshtein distance between two strings (case-insensitive).
 */
function levenshtein(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

/**
 * Returns a similarity score 0–1 between two strings.
 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Try to extract a wake-word match and trailing command from a transcript.
 * Uses the primary wake name + aliases, with fuzzy matching.
 *
 * Returns `{ matched: true, command: string }` or `{ matched: false }`.
 */
export function matchWakeWord(
  transcript: string,
  wakeName: string,
  aliases: string[],
  sensitivity: number // 0–1, higher = stricter
): { matched: boolean; command: string } {
  const lower = transcript.toLowerCase().trim();
  const candidates = [wakeName, ...aliases].map((c) => c.toLowerCase().trim()).filter(Boolean);
  const threshold = 0.5 + sensitivity * 0.4; // sensitivity 0.7 → threshold 0.78

  // Split into words and try sliding windows of candidate-length words
  const words = lower.split(/[\s,]+/);

  for (const candidate of candidates) {
    const candWords = candidate.split(/\s+/);
    const candLen = candWords.length;

    for (let i = 0; i < words.length; i++) {
      const window = words.slice(i, i + candLen).join(' ');
      const score = similarity(window, candidate);

      if (score >= threshold) {
        // Strip optional prefix like "hey", "ok", etc.
        let prefixStart = i;
        if (i > 0) {
          const prev = words[i - 1];
          if (['hey', 'hi', 'hello', 'ok', 'okay', 'yo'].includes(prev)) {
            prefixStart = i - 1;
          }
        }
        // Everything after the matched wake word is the command
        const commandWords = words.slice(i + candLen);
        const command = commandWords.join(' ').trim();
        return { matched: true, command };
      }
    }
  }

  return { matched: false, command: '' };
}
