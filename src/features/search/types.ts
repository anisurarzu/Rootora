/**
 * Smart search types — designed so an AI provider can plug in later
 * without changing the UI contract.
 */

export type SearchLocale = "en" | "bn" | "mixed";

export type SearchResultKind = "product" | "category" | "blog" | "suggestion";

export type SearchHit = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
  image?: string | null;
  price?: number | null;
  score: number;
  /** Why this matched — useful for debugging / future AI explainability */
  matchReasons?: string[];
};

export type SearchResponse = {
  query: string;
  normalizedQuery: string;
  expandedTerms: string[];
  locale: SearchLocale;
  products: SearchHit[];
  categories: SearchHit[];
  blogs: SearchHit[];
  trending: SearchHit[];
  suggestions: string[];
  popular: string[];
  tookMs: number;
  /** Provider id — "lexical" now, "ai" later */
  provider: "lexical" | "ai";
};

export type SearchQueryInput = {
  q: string;
  limit?: number;
  includeTrending?: boolean;
};

/** Future AI / vector search adapter */
export interface SearchProvider {
  readonly id: SearchResponse["provider"];
  search(input: SearchQueryInput): Promise<SearchResponse>;
}
