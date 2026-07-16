import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Save your favourite ROOTORA products — organic foods, fresh produce, and artisan crafts from Bangladeshi farmers.",
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
