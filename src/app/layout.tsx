import type { Metadata } from "next";
import { bodyFont, buttonFont, headingFont } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "organic food",
    "Bangladeshi marketplace",
    "fresh produce",
    "farm to table",
    "handmade products",
    "traditional clothing",
    "ROOTORA",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${buttonFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
