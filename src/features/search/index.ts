export type {
  SearchHit,
  SearchProvider,
  SearchQueryInput,
  SearchResponse,
} from "@/features/search/types";
export { runSmartSearch, getSearchProvider, setSearchProvider } from "@/features/search/service";
export { AISearchProvider } from "@/features/search/ai-adapter";
