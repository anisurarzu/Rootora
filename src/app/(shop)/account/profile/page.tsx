import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/features/account/actions";
import { requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile",
  description: "Update your ROOTORA account profile.",
};

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, email: true },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your personal information.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Your email cannot be changed here. Contact support if you need help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="max-w-md space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user?.email ?? session.user.email}
                disabled
                aria-describedby="email-help"
              />
              <p id="email-help" className="text-xs text-muted-foreground">
                Email is managed through your login credentials.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={user?.name ?? session.user.name}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user?.phone ?? ""}
                placeholder="+880 1XXX-XXXXXX"
                autoComplete="tel"
              />
            </div>

            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
