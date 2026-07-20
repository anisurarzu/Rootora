import type { Metadata, Viewport } from "next";
import { getTheme } from "@teispace/next-themes/server";
import { bodyFont, buttonFont, headingFont } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Lets Chrome/Android resize layout when the keyboard opens (stable chat UI).
  interactiveWidget: "resizes-content",
};
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
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getTheme({ cookieName: "theme" });

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${buttonFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        <AppProviders initialTheme={initialTheme}>{children}</AppProviders>
      </body>
    </html>
  );
}
