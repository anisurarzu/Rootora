import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your ROOTORA order status — enter your order number and email to see delivery updates.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
