"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { CartPreview } from "@/components/layout/cart-preview";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ShopMegaMenu } from "@/components/layout/shop-mega-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { GlobalSearchBar } from "@/components/shop/global-search-bar";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/constants/navigation";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const base = href.split("?")[0] ?? href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchHostRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  const shopItem = NAV_ITEMS.find((item) => item.label === "Shop");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShopOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = searchHostRef.current?.querySelector("input");
        input?.focus();
        input?.select();
      }
      if (event.key === "Escape") setShopOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  };

  const scheduleCloseShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 140);
  };

  const focusSearch = () => {
    const input = searchHostRef.current?.querySelector("input");
    input?.focus();
  };

  const iconBtn =
    "h-10 w-10 text-white hover:bg-white/10 hover:text-white";

  return (
    <>
      <header
        className={cn(
          "relative sticky top-0 z-50 w-full border-b border-white/10 bg-primary transition-shadow duration-300",
          isScrolled && "shadow-[0_8px_30px_rgba(15,23,42,0.18)]"
        )}
        onMouseLeave={scheduleCloseShop}
      >
        <nav
          className="container-rootora flex h-14 items-center gap-3 sm:h-16 sm:gap-5 lg:gap-8"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="shrink-0 font-heading text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            {siteConfig.name}
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              const isShop = item.label === "Shop";

              return (
                <li
                  key={item.href}
                  onMouseEnter={() => {
                    if (isShop) openShop();
                    else setShopOpen(false);
                  }}
                >
                  <Link
                    href={item.href}
                    onFocus={() => {
                      if (isShop) openShop();
                    }}
                    aria-expanded={isShop ? shopOpen : undefined}
                    aria-haspopup={isShop ? "menu" : undefined}
                    className={cn(
                      "group relative inline-flex items-center px-3 py-2 font-button text-[13px] font-medium tracking-wide transition-colors duration-200",
                      active || (isShop && shopOpen)
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-[1.5px] origin-left bg-white transition-transform duration-300 ease-out",
                        active || (isShop && shopOpen)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <div
              ref={searchHostRef}
              className="hidden min-w-[14rem] max-w-md flex-1 md:block lg:min-w-[18rem] xl:min-w-[22rem]"
            >
              <GlobalSearchBar
                className="w-full"
                placeholder="Search ROOTORA"
                buttonClassName="bg-[#243d28] hover:bg-[#1c3121] text-white"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(iconBtn, "md:hidden")}
              onClick={() => setMobileOpen(true)}
              aria-label="Search in menu"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </Button>

            <button
              type="button"
              onClick={focusSearch}
              className="pointer-events-auto hidden select-none items-center gap-1 rounded-md border border-white/20 bg-white/10 px-1.5 py-1 font-button text-[10px] font-medium text-white transition-colors hover:bg-white/15 xl:inline-flex"
              aria-label="Focus search (⌘K)"
            >
              <span className="text-[11px]">⌘</span>K
            </button>

            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                className={cn(iconBtn, "hidden sm:inline-flex")}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" strokeWidth={1.75} />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={1.75} />
                )}
              </Button>
            ) : null}

            <UserMenu className={iconBtn} />

            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Wishlist"
              className={cn(iconBtn, "relative hidden sm:inline-flex")}
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" strokeWidth={1.75} />
                {mounted && wishlistCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
                    {wishlistCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            <CartPreview
              className={iconBtn}
              badgeClassName="bg-white text-primary"
            />

            <Button
              variant="ghost"
              size="icon"
              className={cn(iconBtn, "lg:hidden")}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </div>
        </nav>

        {shopItem?.children ? (
          <div
            onMouseEnter={openShop}
            onMouseLeave={scheduleCloseShop}
            className={cn(
              "absolute inset-x-0 top-full transition-[opacity,visibility] duration-200",
              shopOpen
                ? "visible opacity-100"
                : "invisible pointer-events-none opacity-0"
            )}
          >
            <ShopMegaMenu
              categories={shopItem.children}
              open={shopOpen}
              onNavigate={() => setShopOpen(false)}
            />
          </div>
        ) : null}

        <div className="border-t border-white/10 px-4 py-2 md:hidden">
          <GlobalSearchBar
            className="w-full"
            placeholder="Search products..."
            buttonClassName="bg-[#243d28] hover:bg-[#1c3121] text-white"
          />
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        wishlistCount={mounted ? wishlistCount : 0}
      />
    </>
  );
}
