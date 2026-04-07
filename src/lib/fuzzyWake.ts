function normalizeSpeech(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\b(?:um|uh|erm|hmm)\b/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const source = a.toLowerCase();
  const target = b.toLowerCase();
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      matrix[i][j] =
        source[i - 1] === target[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }

  return matrix[source.length][target.length];
}

function similarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  return 1 - levenshtein(a, b) / maxLength;
}

function phoneticKey(value: string): string {
  return normalizeSpeech(value)
    .replace(/\s+/g, '')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/z/g, 's')
    .replace(/(.)\1+/g, '$1')
    .replace(/[aeiou]/g, '');
}

function buildWakeCandidates(wakeName: string, aliases: string[]): string[] {
  const normalizedWakeName = normalizeSpeech(wakeName);
  const automaticAliases = normalizedWakeName === 'jarvis'
    ? ['javis', 'jervis', 'jarviss', 'jarvus', 'jiva', 'hey jarvis', 'hey javis', 'hey jervis', 'a jarvis', 'hey jarvus']
    : [];

  // Also add "hey <wakeName>" variant automatically
  const heyVariant = `hey ${normalizedWakeName}`;

  return Array.from(
    new Set([wakeName, heyVariant, ...aliases, ...automaticAliases].map((candidate) => normalizeSpeech(candidate)).filter(Boolean))
  );
}

function wakeWordScore(spoken: string, candidate: string): number {
  const normalizedSpoken = normalizeSpeech(spoken);
  const normalizedCandidate = normalizeSpeech(candidate);
  const directScore = similarity(normalizedSpoken, normalizedCandidate);
  const compactScore = similarity(
    normalizedSpoken.replace(/\s+/g, ''),
    normalizedCandidate.replace(/\s+/g, '')
  );
  const spokenPhonetic = phoneticKey(normalizedSpoken);
  const candidatePhonetic = phoneticKey(normalizedCandidate);
  const phoneticScore = spokenPhonetic && candidatePhonetic
    ? similarity(spokenPhonetic, candidatePhonetic)
    : 0;

  return Math.max(directScore, compactScore, phoneticScore);
}

export function matchWakeWord(
  transcript: string,
  wakeName: string,
  aliases: string[],
  sensitivity: number
): { matched: boolean; command: string } {
  const normalizedTranscript = normalizeSpeech(transcript);
  const words = normalizedTranscript.split(/\s+/).filter(Boolean);
  const candidates = buildWakeCandidates(wakeName, aliases);
  const threshold = 0.52 + sensitivity * 0.16;

  for (const candidate of candidates) {
    const candidateWords = candidate.split(/\s+/).filter(Boolean);
    const candidateLength = candidateWords.length;

    for (let index = 0; index < words.length; index += 1) {
      const spokenWindow = words.slice(index, index + candidateLength).join(' ');
      if (!spokenWindow) continue;

      const score = wakeWordScore(spokenWindow, candidate);
      if (score < threshold) continue;

      const command = words.slice(index + candidateLength).join(' ').trim();
      return { matched: true, command };
    }
  }

  return { matched: false, command: '' };
}
