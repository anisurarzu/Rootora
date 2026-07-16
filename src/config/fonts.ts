import { Cormorant_Garamond, Inter, Manrope } from "next/font/google";

export const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const buttonFont = Manrope({
  subsets: ["latin"],
  variable: "--font-button",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
