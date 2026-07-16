import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/features/account/actions";
import { requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your delivery addresses.",
};

export default async function AddressesPage() {
  const session = await requireSession();

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Addresses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Save addresses for faster checkout.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="saved-addresses-heading">
          <h2
            id="saved-addresses-heading"
            className="mb-4 font-heading text-xl font-semibold text-heading"
          >
            Saved addresses
          </h2>

          {addresses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <MapPin
                    className="h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  No saved addresses yet. Add one using the form.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-4" aria-label="Saved addresses">
              {addresses.map((address) => (
                <li key={address.id}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{address.label}</CardTitle>
                        {address.isDefault && (
                          <Badge variant="success">Default</Badge>
                        )}
                      </div>
                      <CardDescription>{address.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <address className="not-italic text-sm text-muted-foreground">
                        {address.addressLine1}
                        {address.addressLine2 && (
                          <>
                            <br />
                            {address.addressLine2}
                          </>
                        )}
                        <br />
                        {address.district}, {address.postalCode}
                        <br />
                        {address.phone}
                      </address>

                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault && (
                          <form action={setDefaultAddress.bind(null, address.id)}>
                            <Button type="submit" variant="outline" size="sm">
                              Set as default
                            </Button>
                          </form>
                        )}
                        <form action={deleteAddress.bind(null, address.id)}>
                          <Button type="submit" variant="ghost" size="sm">
                            Remove
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="add-address-heading">
          <h2
            id="add-address-heading"
            className="mb-4 font-heading text-xl font-semibold text-heading"
          >
            Add new address
          </h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery address</CardTitle>
              <CardDescription>
                Fields marked with an asterisk are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createAddress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">
                    Label <span aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="label"
                    name="label"
                    required
                    placeholder="Home, Office, etc."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Recipient name <span aria-hidden="true">*</span>
                    </Label>
                    <Input id="name" name="name" required autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">
                    Address line 1 <span aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    required
                    autoComplete="address-line1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    autoComplete="address-line2"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="district">
                      District <span aria-hidden="true">*</span>
                    </Label>
                    <Input id="district" name="district" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      Postal code <span aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <Label htmlFor="isDefault" className="font-normal">
                    Set as default address
                  </Label>
                </div>

                <Button type="submit">Save address</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
