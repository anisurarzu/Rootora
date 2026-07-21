import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Package,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { canAccessAdmin, requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const quickLinks = [
  {
    href: "/account/orders",
    icon: Package,
    title: "Orders",
    description: "View order history",
  },
  {
    href: "/account/addresses",
    icon: MapPin,
    title: "Addresses",
    description: "Manage delivery addresses",
  },
  {
    href: "/account/profile",
    icon: User,
    title: "Profile",
    description: "Update your details",
  },
  {
    href: "/wishlist",
    icon: Heart,
    title: "Wishlist",
    description: "Saved products",
  },
  {
    href: "/cart",
    icon: ShoppingBag,
    title: "Cart",
    description: "Review your cart",
  },
];

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

export default async function AccountPage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, image: true },
  });

  const orderCount = await prisma.order.count({
    where: { userId: session.user.id, ...activeOrderWhere },
  });

  const hasAdminAccess = await canAccessAdmin(user?.role ?? session.user.role);
  const displayName = user?.name ?? session.user.name;
  const displayEmail = user?.email ?? session.user.email;
  const image = user?.image;

  return (
    <div>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/10">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-heading text-xl font-semibold text-primary">
              {getInitials(displayName, displayEmail)}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-heading text-3xl font-semibold text-heading">
            Overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {displayName}.
          </p>
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your profile information at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium text-heading">{displayName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium text-heading">{displayEmail}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd className="mt-1">
                <Badge variant={hasAdminAccess ? "accent" : "secondary"}>
                  {user?.role ?? session.user.role ?? "CUSTOMER"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Total orders
              </dt>
              <dd className="mt-1 font-medium text-heading">{orderCount}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="outline">
              <Link href="/account/profile">Edit profile</Link>
            </Button>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>

      {hasAdminAccess ? (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">Admin access</CardTitle>
            </div>
            <CardDescription>
              Your role can access the ROOTORA admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin">Go to admin dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="quick-links-heading">
        <h2
          id="quick-links-heading"
          className="mb-4 font-heading text-xl font-semibold text-heading"
        >
          Quick links
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-border bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold text-heading">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
