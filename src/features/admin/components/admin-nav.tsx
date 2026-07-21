"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FolderTree,
  LayoutDashboard,
  MessageCircle,
  Package,
  PanelTop,
  Settings,
  ShoppingCart,
  Sprout,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/homepage", label: "Homepage", icon: PanelTop },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/support", label: "Support", icon: MessageCircle },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/farmers", label: "Farmers", icon: Sprout },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminNavProps = {
  /** Desktop green sidebar vs mobile light strip */
  variant?: "sidebar" | "light";
  /** Unread / waiting support chats */
  supportAttentionCount?: number;
};

export function AdminNav({
  variant = "sidebar",
  supportAttentionCount = 0,
}: AdminNavProps) {
  const pathname = usePathname();
  const isSidebar = variant === "sidebar";

  return (
    <nav aria-label="Admin navigation">
      <ul className="space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          const showBadge =
            href === "/admin/support" && supportAttentionCount > 0;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 font-button text-sm font-medium transition-colors",
                  isSidebar &&
                    (isActive
                      ? "bg-white text-primary shadow-none"
                      : "text-white/85 hover:bg-white hover:text-primary"),
                  !isSidebar &&
                    (isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"),
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {showBadge ? (
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                      isSidebar && isActive
                        ? "bg-primary text-white"
                        : isSidebar
                          ? "bg-white text-primary"
                          : isActive
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-primary text-primary-foreground",
                    )}
                    aria-label={`${supportAttentionCount} support chats need attention`}
                  >
                    {supportAttentionCount > 9 ? "9+" : supportAttentionCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
