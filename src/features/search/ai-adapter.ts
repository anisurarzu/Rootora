import type { SearchProvider, SearchQueryInput, SearchResponse } from "@/features/search/types";
import { LexicalSearchProvider } from "@/features/search/service";

/**
 * Placeholder AI provider — currently delegates to lexical search.
 * Replace `search()` with embeddings / LLM ranking when ready.
 */
export class AISearchProvider implements SearchProvider {
  readonly id = "ai" as const;
  private fallback = new LexicalSearchProvider();

  async search(input: SearchQueryInput): Promise<SearchResponse> {
    // Future: call OpenAI / custom RAG, then merge with lexical hits.
    const lexical = await this.fallback.search(input);
    return {
      ...lexical,
      provider: "ai",
    };
  }
}
