"use client";

import { useSearchParams } from "next/navigation";
import { Grid3X3, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const sortOptions = [
  { label: "Featured", value: "" },
  { label: "Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

interface ShopToolbarProps {
  total: number;
}

export function ShopToolbar({ total }: ShopToolbarProps) {
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "";

  const buildSortUrl = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{total}</span> products
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <div className="hidden items-center rounded-lg border border-border sm:flex">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-l-lg bg-muted text-primary"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted"
            aria-label="List view"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>

        <select
          value={currentSort}
          onChange={(e) => {
            window.location.href = buildSortUrl(e.target.value);
          }}
          className="rounded-lg border border-input bg-surface px-3 py-2 font-button text-sm"
          aria-label="Sort products"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
