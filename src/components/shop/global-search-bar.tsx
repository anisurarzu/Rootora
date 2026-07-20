"use client";

import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POPULAR_SEARCHES } from "@/constants/navigation";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from "@/lib/search-history";
import { cn } from "@/lib/utils";

interface GlobalSearchBarProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  showSuggestions?: boolean;
}

function subscribeRecentSearches(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("rootora-recent-searches", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("rootora-recent-searches", onStoreChange);
  };
}

function notifyRecentSearchesChanged() {
  window.dispatchEvent(new Event("rootora-recent-searches"));
}

const EMPTY_RECENT_SEARCHES: string[] = [];

let cachedRecentSearches: string[] = EMPTY_RECENT_SEARCHES;

function getRecentSearchesSnapshot() {
  const next = getRecentSearches();
  if (
    next.length === cachedRecentSearches.length &&
    next.every((term, index) => term === cachedRecentSearches[index])
  ) {
    return cachedRecentSearches;
  }
  cachedRecentSearches = next;
  return cachedRecentSearches;
}

function getServerRecentSearchesSnapshot() {
  return EMPTY_RECENT_SEARCHES;
}

export function GlobalSearchBar({
  className,
  inputClassName,
  buttonClassName,
  placeholder = "Search in ROOTORA",
  showSuggestions = true,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const recentSearches = useSyncExternalStore(
    subscribeRecentSearches,
    getRecentSearchesSnapshot,
    getServerRecentSearchesSnapshot
  );

  const panelOpen = showSuggestions && focused;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) {
      router.push("/shop");
      return;
    }

    addRecentSearch(trimmed);
    notifyRecentSearchesChanged();
    setQuery(trimmed);
    setFocused(false);
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToSearch(query);
  }

  function handleClearRecent() {
    clearRecentSearches();
    notifyRecentSearchesChanged();
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-white shadow-sm",
          focused && "ring-2 ring-white/70"
        )}
        role="search"
      >
        <Input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className={cn(
            "h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent pl-4 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-11 sm:pl-5 sm:text-base",
            inputClassName
          )}
          aria-label="Search products"
          aria-expanded={panelOpen}
          aria-controls="search-suggestions-panel"
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="ghost"
          className={cn(
            "h-10 shrink-0 rounded-none border-0 px-4 text-primary hover:bg-transparent hover:text-primary sm:h-11 sm:px-5",
            buttonClassName
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>

      {panelOpen ? (
        <div
          id="search-suggestions-panel"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-xl border border-border bg-white shadow-lift"
        >
          {recentSearches.length > 0 ? (
            <div className="border-b border-border/70 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-button text-sm font-semibold text-heading">
                  Recently searched
                </p>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-heading"
                  aria-label="Clear recent searches"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-0.5">
                {recentSearches.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => goToSearch(term)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-heading"
                    >
                      <Search className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="truncate">{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="px-4 py-3">
            <p className="mb-2.5 font-button text-sm font-semibold text-heading">
              Popular right now
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goToSearch(term)}
                  className="rounded-full bg-muted/80 px-3 py-1.5 font-button text-xs font-medium text-heading transition-colors hover:bg-muted"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GlobalSearchOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="container-rootora pt-6">
        <GlobalSearchBar
          className="mx-auto max-w-2xl"
          showSuggestions
        />
        <div className="mx-auto mt-4 max-w-2xl text-right">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
