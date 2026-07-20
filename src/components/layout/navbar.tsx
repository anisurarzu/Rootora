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
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { GlobalSearchBar } from "@/components/shop/global-search-bar";
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

        {/* Logo + search + icons */}
        <nav
          className="container-rootora flex items-center gap-2 py-2.5 sm:gap-3 sm:py-3"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={cn(
              "shrink-0 font-heading text-xl font-bold tracking-tight sm:text-2xl",
              isHome ? "text-primary-foreground" : "text-primary"
            )}
          >
            {siteConfig.name}
          </Link>

          <div className="min-w-0 flex-1 px-1 sm:px-2 lg:px-4">
            <GlobalSearchBar
              className="mx-auto w-full max-w-2xl"
              buttonClassName={
                isHome
                  ? "text-primary hover:bg-transparent hover:text-primary"
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
              className={iconButtonClass}
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
              className={iconButtonClass}
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
              className={iconButtonClass}
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
              className={cn("md:hidden", iconButtonClass)}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      {mobileOpen ? <MobileMenu onClose={() => setMobileOpen(false)} /> : null}
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-background md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <span className="font-heading text-xl font-bold text-primary">
          {siteConfig.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => (
          <div key={item.href} className="border-b border-border py-3">
            <Link
              href={item.href}
              onClick={onClose}
              className="font-button text-lg font-medium text-heading"
            >
              {item.label}
            </Link>
            {item.children ? (
              <div className="mt-2 space-y-1 pl-4">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
    </div>
  );
}
