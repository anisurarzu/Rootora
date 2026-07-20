import {
  NO_RESULT_FALLBACKS,
  SEARCH_SYNONYMS,
  TYPO_CORRECTIONS,
} from "@/features/search/synonyms";
import {
  normalizeSearchText,
  tokenize,
} from "@/features/search/normalize";

/**
 * Expand a user query into searchable terms:
 * tokens + typo corrections + synonyms (BN ↔ EN).
 */
export function expandSearchQuery(raw: string): {
  normalized: string;
  terms: string[];
} {
  const normalized = normalizeSearchText(raw);
  const tokens = tokenize(normalized);
  const terms = new Set<string>();

  if (normalized) terms.add(normalized);

  for (const token of tokens) {
    terms.add(token);

    const corrected = TYPO_CORRECTIONS[token];
    if (corrected) {
      terms.add(corrected);
      for (const syn of SEARCH_SYNONYMS[corrected] ?? []) {
        terms.add(normalizeSearchText(syn));
      }
    }

    for (const syn of SEARCH_SYNONYMS[token] ?? []) {
      terms.add(normalizeSearchText(syn));
    }
  }

  return {
    normalized,
    terms: [...terms].filter(Boolean).slice(0, 12),
  };
}

export function suggestWhenEmpty(normalized: string): string[] {
  if (!normalized) return NO_RESULT_FALLBACKS;
  const base = expandSearchQuery(normalized).terms.slice(0, 3);
  return [...new Set([...base, ...NO_RESULT_FALLBACKS])].slice(0, 6);
}
