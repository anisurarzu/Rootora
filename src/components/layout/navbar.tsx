"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { GlobalSearchBar } from "@/components/shop/global-search-bar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/constants/navigation";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { siteConfig } from "@/config/site";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function NavLinks({
  activeMenu,
  setActiveMenu,
  onNavigate,
  className,
  linkClassName,
}: {
  activeMenu: string | null;
  setActiveMenu: (label: string | null) => void;
  onNavigate?: () => void;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <ul className={cn("flex items-center gap-0.5", className)}>
      {NAV_ITEMS.map((item) => (
        <li
          key={item.href}
          className="relative shrink-0"
          onMouseEnter={() => item.children && setActiveMenu(item.label)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-2 font-button text-sm font-medium transition-colors",
              linkClassName
            )}
          >
            {item.label}
            {item.children ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            ) : null}
          </Link>

          {item.children && activeMenu === item.label ? (
            <div className="absolute left-0 top-full z-[80] min-w-[240px] rounded-xl border border-border bg-white p-2 shadow-lift">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-lg px-4 py-2.5 font-button text-sm text-heading transition-colors hover:bg-muted",
                    child.featured && "font-semibold text-primary"
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const iconButtonClass = cn(
    isHome &&
      "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isHome
            ? "bg-primary shadow-soft"
            : isScrolled
              ? "glass border-b border-border shadow-soft"
              : "bg-background border-b border-border/60"
        )}
      >
        {/* Top nav links row */}
        <div
          className={cn(
            "hidden border-b md:block",
            isHome ? "border-white/15" : "border-border/60"
          )}
        >
          <div className="container-rootora relative z-[70] overflow-visible py-1">
            <NavLinks
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              className="gap-0"
              linkClassName={
                isHome
                  ? "whitespace-nowrap text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground"
                  : "whitespace-nowrap text-foreground hover:bg-muted hover:text-primary"
              }
            />
          </div>
        </div>

        {/* Logo + icons (mobile: search goes on row below) */}
        <nav
          className="container-rootora flex items-center gap-1.5 py-1 sm:gap-2 sm:py-2 md:py-2.5"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={cn(
              "shrink-0 font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl",
              isHome ? "text-primary-foreground" : "text-primary"
            )}
          >
            {siteConfig.name}
          </Link>

          {/* Search inline on md+ only */}
          <div className="hidden min-w-0 flex-1 md:block">
            <GlobalSearchBar
              className="mx-auto w-full max-w-2xl"
              buttonClassName={
                isHome
                  ? "bg-[#243d28] hover:bg-[#1c3121] text-white"
                  : undefined
              }
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className={cn("hidden sm:inline-flex", iconButtonClass)}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label={session ? "My account" : "Sign in"}
              className={cn("h-9 w-9", iconButtonClass)}
            >
              <Link href={session ? "/account" : "/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Wishlist"
              className={cn("hidden sm:inline-flex", iconButtonClass)}
            >
              <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 ? (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                      isHome
                        ? "bg-white text-primary"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {wishlistCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Cart"
              className={cn("h-9 w-9", iconButtonClass)}
            >
              <Link href="/cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 ? (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                      isHome
                        ? "bg-white text-primary"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 md:hidden", iconButtonClass)}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>

        {/* Full-width search on mobile */}
        <div className="container-rootora pb-1.5 pt-0 md:hidden">
          <GlobalSearchBar
            className="w-full"
            placeholder="Search products..."
            buttonClassName={
              isHome
                ? "bg-[#243d28] hover:bg-[#1c3121] text-white"
                : undefined
            }
          />
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cartCount={mounted ? cartCount : 0}
        wishlistCount={mounted ? wishlistCount : 0}
      />
    </>
  );
}
