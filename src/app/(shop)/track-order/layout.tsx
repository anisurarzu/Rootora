import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your ROOTORA order with just your order number — see packing, shipping, and delivery updates live.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
