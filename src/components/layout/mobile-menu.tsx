"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore, useState } from "react";
import {
  Candy,
  ChevronDown,
  ClipboardList,
  Droplets,
  Heart,
  HelpCircle,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Package,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { GlobalSearchBar } from "@/components/shop/global-search-bar";
import { ProductImage } from "@/components/shop/product-image";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/constants/navigation";
import { siteConfig } from "@/config/site";
import { signOut, useSession } from "@/lib/auth-client";
import {
  getRecentlyViewed,
  subscribeRecentlyViewed,
} from "@/lib/recently-viewed";
import { useCartStore } from "@/features/cart/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  wishlistCount: number;
}

const CATEGORY_ICONS = {
  droplets: Droplets,
  leaf: Leaf,
  candy: Candy,
  shirt: Shirt,
  sparkles: Sparkles,
} as const;

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function MobileMenu({
  open,
  onClose,
  wishlistCount,
}: MobileMenuProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("Shop");
  const [entered, setEntered] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());

  const recentlyViewed = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewed,
    getRecentlyViewed
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => setEntered(true));
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setExpanded("Shop");
  }, [open]);

  if (!open) return null;

  const user = session?.user;
  const isLoggedIn = Boolean(user);
  const shopChildren =
    NAV_ITEMS.find((item) => item.label === "Shop")?.children ?? [];

  const accountShortcuts = isLoggedIn
    ? [
        { href: "/account", label: "Profile", icon: User },
        { href: "/account/orders", label: "Orders", icon: ClipboardList },
        { href: "/account/addresses", label: "Addresses", icon: MapPin },
        { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
      ]
    : [
        { href: "/login", label: "Sign in", icon: LogIn },
        { href: "/register", label: "Register", icon: UserPlus },
        { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
        { href: "/track-order", label: "Track", icon: Package },
      ];

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(100vw,22rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          entered ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3.5">
          <span className="font-heading text-lg font-bold tracking-tight text-primary">
            {siteConfig.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
            className="h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="border-b border-black/[0.06] px-4 py-4">
            <GlobalSearchBar
              className="w-full"
              placeholder="Search products..."
            />
          </div>

          <div className="border-b border-black/[0.06] px-4 py-4">
            <p className="mb-3 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </p>
            {isLoggedIn ? (
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {getInitials(user?.name, user?.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">
                    {user?.name || "My Account"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted-foreground">
                Sign in for faster checkout and order tracking.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {accountShortcuts.map(({ href, label, icon: Icon, count }) => (
                <Link
                  key={`${href}-${label}`}
                  href={href}
                  onClick={onClose}
                  className="relative flex items-center gap-2 rounded-xl border border-black/[0.06] px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
                >
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  {label}
                  {count && count > 0 ? (
                    <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {count}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-black/[0.06] px-4 py-4">
            <Link
              href="/cart"
              onClick={onClose}
              className="relative flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.06] px-3 py-3 transition-colors hover:border-primary/25"
            >
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Cart</span>
              {cartCount > 0 ? (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/help"
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.06] px-3 py-3 transition-colors hover:border-primary/25"
            >
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Help</span>
            </Link>
          </div>

          <nav className="px-4 py-4" aria-label="Mobile navigation">
            <p className="mb-2 px-1 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Browse
            </p>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isExpanded = expanded === item.label;

                if (!hasChildren) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block rounded-xl px-3 py-3 font-button text-sm font-semibold text-heading transition-colors hover:bg-[#f7f7f5]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) =>
                          current === item.label ? null : item.label
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-button text-sm font-semibold text-heading transition-colors hover:bg-[#f7f7f5]"
                      aria-expanded={isExpanded}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <ul className="space-y-1 pb-2 pl-1">
                          <li>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className="block rounded-lg px-3 py-2 text-sm font-medium text-primary"
                            >
                              View all {item.label.toLowerCase()}
                            </Link>
                          </li>
                          {shopChildren.map((child) => {
                            const Icon =
                              CATEGORY_ICONS[
                                (child.icon as keyof typeof CATEGORY_ICONS) ??
                                  "leaf"
                              ] ?? Leaf;

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#f7f7f5]"
                                >
                                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f3f3f1] text-primary">
                                    {child.image ? (
                                      <Image
                                        src={child.image}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                      />
                                    ) : (
                                      <Icon className="h-4 w-4" />
                                    )}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-heading">
                                      {child.label}
                                    </span>
                                    {child.description ? (
                                      <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                                        {child.description}
                                      </span>
                                    ) : null}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {recentlyViewed.length > 0 ? (
            <div className="border-t border-black/[0.06] px-4 py-4">
              <p className="mb-3 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recently viewed
              </p>
              <ul className="flex gap-3 overflow-x-auto pb-1">
                {recentlyViewed.slice(0, 6).map((product) => (
                  <li key={product.id} className="w-28 shrink-0">
                    <Link
                      href={`/shop/${product.slug}`}
                      onClick={onClose}
                      className="block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-black/[0.05] bg-white">
                        <div className="absolute inset-2">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            fit="contain"
                            sizes="112px"
                          />
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-heading">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-primary">
                        {formatPrice(product.price)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {mounted ? (
          <div className="border-t border-black/[0.06] p-4">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-[#f7f7f5]"
            >
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
