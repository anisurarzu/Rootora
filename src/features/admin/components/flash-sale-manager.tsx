"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/features/admin/products/components/form-field";
import {
  setFlashSaleProducts,
  updateFlashSaleSettings,
} from "@/features/admin/actions/flash-sale";
import { cn, formatPrice } from "@/lib/utils";

export type FlashSaleSettingsForm = {
  enabled: boolean;
  title: string;
  subtitle: string;
  shopAllLabel: string;
  shopAllHref: string;
  viewAllLabel: string;
  viewAllHref: string;
  productLimit: number;
  useAutoSale: boolean;
  endsAt: string;
};

export type FlashSaleItemRow = {
  id: string;
  productId: string;
  sortOrder: number;
  active: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    price: number;
    salePrice: number | null;
    discountPercent: number;
    status: string;
  };
};

export type FlashSaleProductOption = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
};

type FlashSaleManagerProps = {
  settings: FlashSaleSettingsForm;
  items: FlashSaleItemRow[];
  productOptions: FlashSaleProductOption[];
  canManage: boolean;
};

function currentDiscountPercent(item: FlashSaleItemRow) {
  if (item.product.discountPercent > 0) return item.product.discountPercent;
  if (
    item.product.salePrice != null &&
    item.product.price > item.product.salePrice
  ) {
    return Math.round(
      ((item.product.price - item.product.salePrice) / item.product.price) * 100
    );
  }
  return 0;
}

export function FlashSaleManager({
  settings,
  items,
  productOptions,
  canManage,
}: FlashSaleManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(settings);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    items.map((item) => item.productId)
  );
  const [discountPercent, setDiscountPercent] = useState(() => {
    const fromItems = items
      .map((item) => currentDiscountPercent(item))
      .find((value) => value > 0);
    return String(fromItems || 15);
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    setSelectedIds(items.map((item) => item.productId));
    const fromItems = items
      .map((item) => currentDiscountPercent(item))
      .find((value) => value > 0);
    if (fromItems) setDiscountPercent(String(fromItems));
  }, [items]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productOptions;
    return productOptions.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q)
    );
  }, [productOptions, search]);

  const selectedProducts = useMemo(() => {
    const byId = new Map(productOptions.map((product) => [product.id, product]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter((product): product is FlashSaleProductOption => Boolean(product));
  }, [productOptions, selectedIds]);

  const previewPct = Number(discountPercent);
  const dirty =
    selectedIds.join(",") !== items.map((item) => item.productId).join(",");

  function toggleProduct(productId: string) {
    if (!canManage || pending) return;
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }

  function saveSettings() {
    if (!canManage) return;
    startTransition(async () => {
      const result = await updateFlashSaleSettings({
        ...form,
        productLimit: 3,
        shopAllLabel: form.shopAllLabel || "View details",
        shopAllHref: form.shopAllHref || "/shop/flash-sale",
        viewAllLabel: form.viewAllLabel || "View details",
        viewAllHref: form.viewAllHref || "/shop/flash-sale",
        subtitle: form.subtitle.trim() || null,
        endsAt: form.endsAt.trim() || null,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function saveProducts() {
    if (!canManage) return;
    const pct = Number(discountPercent);
    if (selectedIds.length > 0 && (!Number.isFinite(pct) || pct < 1)) {
      toast.error("Enter a discount % (1–90)");
      return;
    }
    startTransition(async () => {
      const result = await setFlashSaleProducts({
        productIds: selectedIds,
        discountPercent: selectedIds.length > 0 ? pct : 15,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" fill="currentColor" />
            Flash Sale (hero right sidebar)
          </CardTitle>
          <CardDescription>
            Pick as many products as you want from the grid, set discount %,
            then Save. Homepage sidebar shows 3; View details opens the full
            list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="font-button text-sm font-medium">Show Flash Sale</p>
              <p className="text-xs text-muted-foreground">
                Turn off to hide the hero right sidebar
              </p>
            </div>
            <Switch
              checked={form.enabled}
              disabled={!canManage || pending}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title" htmlFor="flashTitle">
              <Input
                id="flashTitle"
                value={form.title}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Subtitle (optional)" htmlFor="flashSubtitle">
              <Input
                id="flashSubtitle"
                value={form.subtitle}
                placeholder="Ends tonight · Limited stock"
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subtitle: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Header link label" htmlFor="shopAllLabel">
              <Input
                id="shopAllLabel"
                value={form.shopAllLabel}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    shopAllLabel: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Header link URL" htmlFor="shopAllHref">
              <Input
                id="shopAllHref"
                value={form.shopAllHref}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    shopAllHref: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Footer button label" htmlFor="viewAllLabel">
              <Input
                id="viewAllLabel"
                value={form.viewAllLabel}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    viewAllLabel: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Footer button URL" htmlFor="viewAllHref">
              <Input
                id="viewAllHref"
                value={form.viewAllHref}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    viewAllHref: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Countdown ends at (optional)" htmlFor="endsAt">
              <Input
                id="endsAt"
                type="datetime-local"
                value={form.endsAt}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endsAt: event.target.value }))
                }
              />
            </FormField>
          </div>

          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={pending} onClick={saveSettings}>
                {pending ? "Saving…" : "Save Flash Sale settings"}
              </Button>
              {form.endsAt ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setForm((prev) => ({ ...prev, endsAt: "" }))}
                >
                  Clear countdown
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Flash Sale products</CardTitle>
          <CardDescription>
            Full catalog below — click to multi-select (unlimited). 8 products
            per row. Hero sidebar still shows only the first 3; the rest open
            via View details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium">Search</p>
              <Input
                value={search}
                placeholder="Search products…"
                disabled={pending}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="w-full space-y-2 sm:w-32">
              <p className="text-sm font-medium">Discount %</p>
              <Input
                type="number"
                min={1}
                max={90}
                value={discountPercent}
                disabled={!canManage || pending}
                onChange={(event) => setDiscountPercent(event.target.value)}
              />
            </div>
            {canManage ? (
              <Button
                type="button"
                disabled={pending}
                onClick={saveProducts}
                className="sm:mb-0"
              >
                {pending ? "Saving…" : "Save products"}
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Selected{" "}
              <span className="font-semibold text-heading">
                {selectedIds.length}
              </span>
              {selectedIds.length > 3 ? (
                <span className="ml-1 text-xs">
                  (sidebar shows first 3)
                </span>
              ) : null}
              {dirty ? (
                <span className="ml-2 text-orange-600">· unsaved changes</span>
              ) : null}
            </p>
            {selectedIds.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!canManage || pending}
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </Button>
            ) : null}
          </div>

          {selectedProducts.length > 0 ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-heading">
                Will show in Flash Sale
              </p>
              <ol className="flex flex-wrap gap-2">
                {selectedProducts.map((product, index) => {
                  const sale =
                    Number.isFinite(previewPct) && previewPct > 0
                      ? Math.round(product.price * (100 - previewPct)) / 100
                      : null;
                  return (
                    <li
                      key={product.id}
                      className="flex max-w-[220px] items-center gap-2 rounded-md border border-border bg-white px-2 py-1.5"
                    >
                      <span className="text-xs font-bold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sale != null ? (
                            <>
                              <span className="text-destructive">
                                {formatPrice(sale)}
                              </span>{" "}
                              <span className="line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            formatPrice(product.price)
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {filteredProducts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              No products found.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {filteredProducts.map((product) => {
                const selected = selectedIds.includes(product.id);
                const selectedIndex = selectedIds.indexOf(product.id);

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={!canManage || pending}
                      onClick={() => toggleProduct(product.id)}
                      className={cn(
                        "group relative flex w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition",
                        selected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="relative aspect-square bg-muted">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        ) : null}
                        {selected ? (
                          <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                            {selectedIndex + 1}
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-0.5 p-1.5">
                        <p className="line-clamp-2 min-h-[2lh] text-[11px] font-medium leading-tight text-heading">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-semibold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {canManage ? (
            <div className="sticky bottom-3 z-10 flex justify-end">
              <Button
                type="button"
                size="lg"
                disabled={pending}
                onClick={saveProducts}
                className="shadow-lg"
              >
                {pending
                  ? "Saving…"
                  : `Save Flash Sale (${selectedIds.length})`}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
