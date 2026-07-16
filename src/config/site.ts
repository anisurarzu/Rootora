export const siteConfig = {
  name: "ROOTORA",
  tagline: "Naturally Bangladeshi.",
  description:
    "Premium Bangladeshi ecommerce marketplace for organic foods, fresh produce, traditional clothing, and artisan handmade products — sourced directly from local farmers.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://rootora.com",
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://instagram.com/rootora",
    facebook: "https://facebook.com/rootora",
    twitter: "https://twitter.com/rootora",
    youtube: "https://youtube.com/@rootora",
  },
  contact: {
    email: "hello@rootora.com",
    phone: "+880 1XXX-XXXXXX",
    address: "Dhaka, Bangladesh",
  },
  currency: "BDT",
  locale: "en-BD",
} as const;

export type SiteConfig = typeof siteConfig;
