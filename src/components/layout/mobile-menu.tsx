"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Package,
  ShoppingBag,
  Sun,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/constants/navigation";
import { siteConfig } from "@/config/site";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  cartCount: number;
  wishlistCount: number;
}

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
  cartCount,
  wishlistCount,
}: MobileMenuProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  if (!open) return null;

  const user = session?.user;
  const isLoggedIn = Boolean(user);

  const toggleSection = (label: string) => {
    setExpanded((current) => (current === label ? null : label));
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const quickLinks = [
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: Heart,
      count: wishlistCount,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingBag,
      count: cartCount,
    },
    {
      href: "/track-order",
      label: "Track Order",
      icon: Package,
      count: 0,
    },
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
      count: 0,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside className="absolute inset-y-0 right-0 flex w-[min(100vw,20rem)] flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-heading text-lg font-bold text-primary">
            Menu
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

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-muted/30 p-4">
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {getInitials(user?.name, user?.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-button text-sm font-semibold text-heading">
                      {user?.name || "My Account"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <ClipboardList className="h-4 w-4 shrink-0" />
                    Orders
                  </Link>
                </div>

                <Link
                  href="/account/addresses"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  Saved addresses
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-heading text-base font-semibold text-heading">
                    Welcome to {siteConfig.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sign in for orders, wishlist sync, and faster checkout.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            {quickLinks.map(({ href, label, icon: Icon, count }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-heading">{label}</span>
                {count > 0 ? (
                  <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>

          <nav className="px-4 pb-4" aria-label="Mobile navigation">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Browse
            </p>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isExpanded = expanded === item.label;
                const hasChildren = Boolean(item.children?.length);

                return (
                  <li key={item.href}>
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleSection(item.label)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-button text-sm font-semibold text-heading transition-colors hover:bg-muted"
                          aria-expanded={isExpanded}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </button>
                        {isExpanded ? (
                          <ul className="mb-1 space-y-0.5 pl-2">
                            <li>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-primary"
                              >
                                View all {item.label.toLowerCase()}
                              </Link>
                            </li>
                            {item.children!.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-heading",
                                    child.featured && "font-medium text-heading"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block rounded-lg px-3 py-3 font-button text-sm font-semibold text-heading transition-colors hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {mounted ? (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-muted"
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
