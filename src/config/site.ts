export const siteConfig = {
  name: "ROOTORA",
  tagline: "Naturally Bangladeshi.",
  description:
    "ROOTORA is a premium Bangladeshi brand dedicated to delivering authentic, high-quality products inspired by our rich heritage. From pure honey to traditional fashion and heritage foods — naturally Bangladeshi.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://shoprootora.com",
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://www.instagram.com/shoprootora/",
    facebook: "https://www.facebook.com/profile.php?id=61592211598377",
    linkedin: "https://www.linkedin.com/company/rootora/",
  },
  contact: {
    email: "shoprootora@gmail.com",
    /** Public support number — set when available. */
    phone: null as string | null,
    address: "Tangail, Dhaka 1900, Bangladesh",
  },
  currency: "BDT",
  locale: "en-BD",
  timeZone: "Asia/Dhaka",
  founded: 2026,
  trialNotice: {
    enabled: true,
    launchLabel: "1 August 2026",
  },
} as const;

export type SiteConfig = typeof siteConfig;
