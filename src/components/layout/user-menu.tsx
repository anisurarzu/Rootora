"use client";

import Link from "next/link";
import {
  ClipboardList,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  User,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  className?: string;
};

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

export function UserMenu({ className }: UserMenuProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={user ? "Account menu" : "Sign in"}
          className={cn("h-10 w-10", className)}
        >
          {user ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-primary">
              {getInitials(user.name, user.email)}
            </span>
          ) : (
            <User className="h-5 w-5" strokeWidth={1.75} />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 rounded-2xl border-black/[0.06] p-2 shadow-lift"
      >
        {user ? (
          <>
            <div className="px-2 py-2">
              <p className="truncate text-sm font-semibold text-heading">
                {user.name || "My account"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/orders" className="cursor-pointer gap-2">
                <ClipboardList className="h-4 w-4" />
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/addresses" className="cursor-pointer gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/wishlist" className="cursor-pointer gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onSelect={() => {
                void signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="cursor-pointer gap-2">
                <UserPlus className="h-4 w-4" />
                Create account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/wishlist" className="cursor-pointer gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/track-order" className="cursor-pointer gap-2">
                <ClipboardList className="h-4 w-4" />
                Track order
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
