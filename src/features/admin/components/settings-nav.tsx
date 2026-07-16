"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/settings", label: "Overview", icon: Shield, exact: true },
  { href: "/admin/settings/roles", label: "Roles & permissions", icon: KeyRound },
  { href: "/admin/settings/users", label: "User roles", icon: Users },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 font-button text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
