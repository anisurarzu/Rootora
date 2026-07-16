"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/mock-data";
import { DISTRICTS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function ShopFilters() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="sticky top-24 space-y-6 rounded-xl border border-border bg-surface p-6 shadow-soft">
      <div>
        <h3 className="font-button text-sm font-semibold uppercase tracking-wider text-heading">
          Filters
        </h3>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          Categories
        </Label>
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                !activeCategory && "bg-muted font-medium text-primary"
              )}
            >
              All Products
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                  activeCategory === cat.slug &&
                    "bg-muted font-medium text-primary"
                )}
              >
                {cat.name}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({cat.productCount})
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <Label htmlFor="price-min" className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          Price Range (৳)
        </Label>
        <div className="flex gap-2">
          <Input id="price-min" type="number" placeholder="Min" min={0} />
          <Input id="price-max" type="number" placeholder="Max" min={0} />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          Availability
        </Label>
        <div className="space-y-2">
          {["In Stock", "Pre-order"].map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              {option}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          District
        </Label>
        <select
          className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm"
          aria-label="Filter by district"
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          Certifications
        </Label>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Organic Certified
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Fair Trade
          </Badge>
        </div>
      </div>
    </div>
  );
}
