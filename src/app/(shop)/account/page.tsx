import Link from "next/link";
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

export default async function AccountPage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  });

  const orderCount = await prisma.order.count({
    where: { userId: session.user.id, ...activeOrderWhere },
  });

  const hasAdminAccess = await canAccessAdmin(user?.role ?? session.user.role);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.name ?? session.user.name}.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Your profile information at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium text-heading">
                {user?.name ?? session.user.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium text-heading">
                {user?.email ?? session.user.email}
              </dd>
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

      {hasAdminAccess && (
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
      )}

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
