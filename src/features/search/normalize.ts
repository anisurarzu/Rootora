/** Lightweight text helpers for BN + EN search */

const BN_RANGE = /[\u0980-\u09FF]/;

export function detectLocale(query: string): "en" | "bn" | "mixed" {
  const hasBn = BN_RANGE.test(query);
  const hasLatin = /[a-zA-Z]/.test(query);
  if (hasBn && hasLatin) return "mixed";
  if (hasBn) return "bn";
  return "en";
}

export function normalizeSearchText(input: string) {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function tokenize(input: string): string[] {
  const normalized = normalizeSearchText(input);
  if (!normalized) return [];
  return normalized
    .split(/[\s,./|_+-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** Levenshtein distance — fine for short catalog terms */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    let prev = i + 1;
    for (let j = 0; j < b.length; j++) {
      const current =
        a[i] === b[j]
          ? row[j]!
          : Math.min(row[j]! + 1, prev + 1, row[j + 1]! + 1);
      row[j] = prev;
      prev = current;
    }
    row[b.length] = prev;
  }
  return row[b.length]!;
}

export function fuzzyScore(query: string, candidate: string): number {
  const q = normalizeSearchText(query);
  const c = normalizeSearchText(candidate);
  if (!q || !c) return 0;
  if (c === q) return 1;
  if (c.includes(q)) return 0.92;
  if (q.includes(c) && c.length >= 3) return 0.8;

  const distance = levenshtein(q, c);
  const maxLen = Math.max(q.length, c.length);
  const similarity = 1 - distance / maxLen;
  return similarity >= 0.65 ? similarity : 0;
}
