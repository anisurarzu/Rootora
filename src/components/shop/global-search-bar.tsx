"use client";

import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Mic, MicOff, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  buildFlatSearchItems,
  SmartSearchPanel,
} from "@/features/search/components/smart-search-panel";
import { useSmartSearch } from "@/features/search/hooks/use-smart-search";
import { useVoiceSearch } from "@/features/search/hooks/use-voice-search";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  subscribeRecentSearches,
} from "@/lib/search-history";
import { cn } from "@/lib/utils";

interface GlobalSearchBarProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  showSuggestions?: boolean;
}

export function GlobalSearchBar({
  className,
  inputClassName,
  buttonClassName,
  placeholder = "Search ROOTORA — honey, মধু, panjabi…",
  showSuggestions = true,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const recentSearches = useSyncExternalStore(
    subscribeRecentSearches,
    getRecentSearches,
    getRecentSearches
  );

  const panelOpen = showSuggestions && focused;
  const { data, loading } = useSmartSearch(query, panelOpen);

  const onVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    setFocused(true);
  }, []);

  const voice = useVoiceSearch(onVoiceResult);

  const flatItems = useMemo(
    () =>
      buildFlatSearchItems({
        query,
        data,
        recentSearches,
        loading,
      }),
    [query, data, recentSearches, loading]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, data.products, data.categories, data.blogs, data.trending]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function rememberAndGo(term: string, href: string) {
    const trimmed = term.trim();
    if (trimmed) addRecentSearch(trimmed);
    setQuery(trimmed || query);
    setFocused(false);
    setActiveIndex(-1);
    router.push(href);
  }

  function goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) {
      router.push("/shop");
      setFocused(false);
      return;
    }
    rememberAndGo(trimmed, `/shop?q=${encodeURIComponent(trimmed)}`);
  }

  function selectHref(href: string, term?: string) {
    rememberAndGo(term || query, href);
  }

  function activateItem(index: number) {
    const item = flatItems[index];
    if (!item) return;
    if (item.type === "hit") {
      selectHref(item.hit.href, query || item.hit.title);
      return;
    }
    if (item.href) {
      selectHref(item.href, item.term || item.label);
      return;
    }
    if (item.term) goToSearch(item.term);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0) {
      activateItem(activeIndex);
      return;
    }
    goToSearch(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!panelOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        flatItems.length === 0 ? -1 : (current + 1) % flatItems.length
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        flatItems.length === 0
          ? -1
          : current <= 0
            ? flatItems.length - 1
            : current - 1
      );
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      activateItem(activeIndex);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-sm transition-shadow sm:h-11",
          focused && "shadow-soft ring-2 ring-primary/20"
        )}
        role="search"
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "h-full min-w-0 flex-1 basis-0 rounded-none border-0 bg-transparent py-0 pl-9 pr-16 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-[15px]",
              inputClassName
            )}
            aria-label="Smart search"
            aria-expanded={panelOpen}
            aria-controls="smart-search-panel"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? flatItems[activeIndex]?.id : undefined
            }
            autoComplete="off"
            spellCheck={false}
          />
          <div className="absolute right-1.5 flex items-center gap-0.5">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-heading"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (voice.listening ? voice.stop() : voice.start())}
              disabled={!voice.supported}
              title={
                voice.supported
                  ? voice.listening
                    ? "Stop voice search"
                    : "Voice search"
                  : "Voice search not supported"
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                voice.listening
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-heading",
                !voice.supported && "cursor-not-allowed opacity-40"
              )}
              aria-label="Voice search"
            >
              {voice.listening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className={cn(
            "inline-flex h-full w-11 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90 sm:w-12",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/50",
            buttonClassName
          )}
          aria-label="Search"
        >
          <Search className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </form>

      <SmartSearchPanel
        open={panelOpen}
        query={query}
        loading={loading}
        data={data}
        recentSearches={recentSearches}
        activeIndex={activeIndex}
        onHoverIndex={setActiveIndex}
        onSelectTerm={goToSearch}
        onSelectHref={selectHref}
        onClearRecent={clearRecentSearches}
        flatItems={flatItems}
      />
    </div>
  );
}
