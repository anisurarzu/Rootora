import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleConfigured = Boolean(googleClientId && googleClientSecret);

const productionHosts = [
  "shoprootora.com",
  "www.shoprootora.com",
  "*.vercel.app",
];

export const auth = betterAuth({
  // Apex + www + Vercel previews all resolve correctly per request
  baseURL: {
    allowedHosts: ["localhost:3000", ...productionHosts],
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
    fallback: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          prompt: "select_account",
        },
      }
    : {},
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  // Default Better Auth sign-in/up limit is 3 req / 10s per IP.
  // BD mobile carriers use CGNAT (many users share one public IP), so that
  // limit blocks legitimate register/login traffic. Use generous per-path caps.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 120,
    customRules: {
      "/sign-in/email": { window: 60, max: 40 },
      "/sign-up/email": { window: 60, max: 30 },
      "/sign-in/*": { window: 60, max: 40 },
      "/sign-up/*": { window: 60, max: 30 },
      "/sign-in/social": { window: 60, max: 40 },
    },
  },
  advanced: {
    // Share session between shoprootora.com and www.shoprootora.com in production only
    ...(process.env.NODE_ENV === "production"
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: ".shoprootora.com",
          },
        }
      : {}),
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
    },
  },
  plugins: [bearer()],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "https://shoprootora.com",
    "https://www.shoprootora.com",
    "http://localhost:3000",
    process.env.MOBILE_CORS_ORIGIN,
  ].filter(Boolean) as string[],
});

export type Session = typeof auth.$Infer.Session;
