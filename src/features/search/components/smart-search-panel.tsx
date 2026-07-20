"use client";

import Image from "next/image";
import {
  BookOpen,
  Clock3,
  FolderOpen,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { SearchHit, SearchResponse } from "@/features/search/types";
import { formatPrice, cn } from "@/lib/utils";

export type SearchFlatItem =
  | { type: "action"; id: string; label: string; href?: string; term?: string }
  | { type: "hit"; id: string; hit: SearchHit };

type SmartSearchPanelProps = {
  open: boolean;
  query: string;
  loading: boolean;
  data: SearchResponse;
  recentSearches: string[];
  activeIndex: number;
  onHoverIndex: (index: number) => void;
  onSelectTerm: (term: string) => void;
  onSelectHref: (href: string, term?: string) => void;
  onClearRecent: () => void;
  flatItems: SearchFlatItem[];
};

function SectionLabel({
  icon: Icon,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 px-1">
      <p className="inline-flex items-center gap-1.5 font-button text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {children}
      </p>
      {action}
    </div>
  );
}

function HitRow({
  hit,
  active,
  onMouseEnter,
  onSelect,
}: {
  hit: SearchHit;
  active: boolean;
  onMouseEnter: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
        active ? "bg-primary/[0.07]" : "hover:bg-[#f6f6f4]"
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f3f1]">
        {hit.image ? (
          <Image
            src={hit.image}
            alt=""
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/50">
            {hit.kind === "blog" ? (
              <BookOpen className="h-4 w-4" />
            ) : hit.kind === "category" ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-heading">{hit.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {hit.kind === "product"
            ? hit.subtitle || "Product"
            : hit.kind === "category"
              ? hit.subtitle || "Category"
              : hit.subtitle || "Article"}
        </p>
      </div>
      {hit.price != null ? (
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {formatPrice(hit.price)}
        </span>
      ) : null}
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2 px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-2.5 py-2">
          <div className="h-12 w-12 rounded-lg bg-[#ecece8]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-[#ecece8]" />
            <div className="h-2.5 w-1/3 rounded bg-[#f0f0ec]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SmartSearchPanel({
  open,
  query,
  loading,
  data,
  recentSearches,
  activeIndex,
  onHoverIndex,
  onSelectTerm,
  onSelectHref,
  onClearRecent,
  flatItems,
}: SmartSearchPanelProps) {
  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const hasHits =
    data.products.length > 0 ||
    data.categories.length > 0 ||
    data.blogs.length > 0;

  const indexMap = new Map(flatItems.map((item, index) => [item.id, index]));

  return (
    <div
      id="smart-search-panel"
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] max-h-[min(70vh,34rem)] overflow-y-auto overscroll-contain rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_60px_-16px_rgba(15,23,42,0.22)]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.05] bg-white/95 px-4 py-2.5 backdrop-blur">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Smart search
          {data.provider === "ai" ? " · AI" : ""}
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          ↑↓ navigate · Enter open · Esc close
        </p>
      </div>

      <div className="space-y-5 px-3 py-4 sm:px-4">
        {!hasQuery ? (
          <>
            {recentSearches.length > 0 ? (
              <section>
                <SectionLabel
                  icon={Clock3}
                  action={
                    <button
                      type="button"
                      onClick={onClearRecent}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-heading"
                    >
                      Clear
                    </button>
                  }
                >
                  Recent
                </SectionLabel>
                <ul className="space-y-0.5">
                  {recentSearches.map((term) => {
                    const id = `recent:${term}`;
                    const index = indexMap.get(id) ?? -1;
                    return (
                      <li key={term}>
                        <button
                          type="button"
                          onMouseEnter={() => index >= 0 && onHoverIndex(index)}
                          onClick={() => onSelectTerm(term)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                            activeIndex === index
                              ? "bg-primary/[0.07] text-heading"
                              : "text-muted-foreground hover:bg-[#f6f6f4] hover:text-heading"
                          )}
                        >
                          <Clock3 className="h-4 w-4 shrink-0 opacity-50" />
                          <span className="truncate">{term}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section>
              <SectionLabel icon={Search}>Popular searches</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {(data.popular.length > 0
                  ? data.popular
                  : ["honey", "organic", "পাঞ্জাবি", "মিষ্টি"]
                ).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSelectTerm(term)}
                    className="rounded-full border border-black/[0.06] bg-[#f7f7f5] px-3 py-1.5 font-button text-xs font-medium text-heading transition-colors hover:border-primary/30 hover:bg-primary/[0.06]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {data.trending.length > 0 ? (
              <section>
                <SectionLabel icon={TrendingUp}>Trending products</SectionLabel>
                <ul className="space-y-0.5">
                  {data.trending.map((hit) => {
                    const id = `hit:${hit.kind}:${hit.id}`;
                    const index = indexMap.get(id) ?? -1;
                    return (
                      <li key={hit.id}>
                        <HitRow
                          hit={hit}
                          active={activeIndex === index}
                          onMouseEnter={() => index >= 0 && onHoverIndex(index)}
                          onSelect={() => onSelectHref(hit.href, hit.title)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </>
        ) : loading ? (
          <SkeletonRows />
        ) : hasHits ? (
          <>
            {data.products.length > 0 ? (
              <section>
                <SectionLabel icon={Search}>Products</SectionLabel>
                <ul className="space-y-0.5">
                  {data.products.map((hit) => {
                    const id = `hit:${hit.kind}:${hit.id}`;
                    const index = indexMap.get(id) ?? -1;
                    return (
                      <li key={hit.id}>
                        <HitRow
                          hit={hit}
                          active={activeIndex === index}
                          onMouseEnter={() => index >= 0 && onHoverIndex(index)}
                          onSelect={() => onSelectHref(hit.href, query)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {data.categories.length > 0 ? (
              <section>
                <SectionLabel icon={FolderOpen}>Categories</SectionLabel>
                <ul className="space-y-0.5">
                  {data.categories.map((hit) => {
                    const id = `hit:${hit.kind}:${hit.id}`;
                    const index = indexMap.get(id) ?? -1;
                    return (
                      <li key={hit.id}>
                        <HitRow
                          hit={hit}
                          active={activeIndex === index}
                          onMouseEnter={() => index >= 0 && onHoverIndex(index)}
                          onSelect={() => onSelectHref(hit.href, query)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {data.blogs.length > 0 ? (
              <section>
                <SectionLabel icon={BookOpen}>Articles</SectionLabel>
                <ul className="space-y-0.5">
                  {data.blogs.map((hit) => {
                    const id = `hit:${hit.kind}:${hit.id}`;
                    const index = indexMap.get(id) ?? -1;
                    return (
                      <li key={hit.id}>
                        <HitRow
                          hit={hit}
                          active={activeIndex === index}
                          onMouseEnter={() => index >= 0 && onHoverIndex(index)}
                          onSelect={() => onSelectHref(hit.href, query)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <button
              type="button"
              onClick={() =>
                onSelectHref(`/shop?q=${encodeURIComponent(query.trim())}`, query)
              }
              className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.04]"
            >
              View all results for “{query.trim()}”
              <Search className="h-4 w-4" />
            </button>
          </>
        ) : (
          <section className="px-1 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f3f1] text-primary">
              <Search className="h-5 w-5" />
            </div>
            <p className="mt-3 font-heading text-base font-semibold text-heading">
              No matches for “{query.trim()}”
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a synonym, Bangla spelling, or one of these ideas.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(data.suggestions.length > 0
                ? data.suggestions
                : data.popular.slice(0, 5)
              ).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectTerm(term)}
                  className="rounded-full border border-black/[0.06] bg-[#f7f7f5] px-3 py-1.5 text-xs font-medium text-heading hover:border-primary/30"
                >
                  {term}
                </button>
              ))}
            </div>
            {data.trending.length > 0 ? (
              <div className="mt-6 text-left">
                <SectionLabel icon={TrendingUp}>Try trending</SectionLabel>
                <ul className="space-y-0.5">
                  {data.trending.map((hit) => (
                    <li key={hit.id}>
                      <HitRow
                        hit={hit}
                        active={false}
                        onMouseEnter={() => undefined}
                        onSelect={() => onSelectHref(hit.href, hit.title)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}

export function buildFlatSearchItems(options: {
  query: string;
  data: SearchResponse;
  recentSearches: string[];
  loading: boolean;
}): SearchFlatItem[] {
  const { query, data, recentSearches, loading } = options;
  const hasQuery = query.trim().length > 0;
  const items: SearchFlatItem[] = [];

  if (!hasQuery) {
    for (const term of recentSearches) {
      items.push({ type: "action", id: `recent:${term}`, label: term, term });
    }
    for (const hit of data.trending) {
      items.push({
        type: "hit",
        id: `hit:${hit.kind}:${hit.id}`,
        hit,
      });
    }
    return items;
  }

  if (loading) return items;

  for (const hit of [...data.products, ...data.categories, ...data.blogs]) {
    items.push({ type: "hit", id: `hit:${hit.kind}:${hit.id}`, hit });
  }

  if (items.length > 0) {
    items.push({
      type: "action",
      id: `view-all:${query.trim()}`,
      label: `View all results for ${query.trim()}`,
      href: `/shop?q=${encodeURIComponent(query.trim())}`,
      term: query.trim(),
    });
  }

  return items;
}
