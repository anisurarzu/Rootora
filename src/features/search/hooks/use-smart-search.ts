"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/features/search/hooks/use-debounced-value";
import type { SearchResponse } from "@/features/search/types";

const emptyResponse = (query = ""): SearchResponse => ({
  query,
  normalizedQuery: "",
  expandedTerms: [],
  locale: "en",
  products: [],
  categories: [],
  blogs: [],
  trending: [],
  suggestions: [],
  popular: [],
  tookMs: 0,
  provider: "lexical",
});

export function useSmartSearch(query: string, enabled: boolean) {
  const debouncedQuery = useDebouncedValue(query, 220);
  const [data, setData] = useState<SearchResponse>(() => emptyResponse());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map());

  const fetchSearch = useCallback(async (q: string) => {
    const key = q.trim().toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q,
        limit: "6",
        trending: "1",
      });
      const res = await fetch(`/api/v1/search?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const json = (await res.json()) as { data: SearchResponse };
      const payload = json.data ?? emptyResponse(q);
      cacheRef.current.set(key, payload);
      if (cacheRef.current.size > 40) {
        const first = cacheRef.current.keys().next().value;
        if (first) cacheRef.current.delete(first);
      }
      setData(payload);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Could not load search results");
      setData(emptyResponse(q));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void fetchSearch(debouncedQuery);
    return () => abortRef.current?.abort();
  }, [debouncedQuery, enabled, fetchSearch]);

  return {
    debouncedQuery,
    data,
    loading,
    error,
    refresh: () => fetchSearch(debouncedQuery),
  };
}
