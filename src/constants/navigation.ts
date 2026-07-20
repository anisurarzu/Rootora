import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "Traditional Clothing", href: "/shop?category=traditional-clothing" },
      { label: "T-shirt", href: "/shop?category=t-shirt" },
      { label: "Honey", href: "/shop?category=honey" },
      { label: "Organic Foods", href: "/shop?filter=organic" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "Organic Collection", href: "/collections/organic", featured: true },
      { label: "Seasonal Picks", href: "/collections/seasonal", featured: true },
      { label: "Gift Boxes", href: "/collections/gift-boxes" },
      { label: "Festival Collection", href: "/collections/festival" },
      { label: "Traditional Clothing", href: "/collections/clothing" },
      { label: "Handmade Products", href: "/collections/handmade" },
    ],
  },
  { label: "Farmers", href: "/farmers" },
  { label: "Track Order", href: "/track-order" },
  { label: "Recipes", href: "/recipes" },
  { label: "Blog", href: "/blog" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Organic Foods", href: "/shop?filter=organic" },
    { label: "Fresh Produce", href: "/shop?category=seasonal-fruits" },
    { label: "Gift Boxes", href: "/collections/gift-boxes" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Farmers", href: "/farmers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQs", href: "/faqs" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export const POPULAR_SEARCHES = [
  "Mustard honey",
  "Porabari cham cham",
  "Black punjabi",
  "White punjabi",
  "Kalojira honey",
  "Litchi honey",
  "Organic",
  "Gift hamper",
  "T-shirt",
  "Seasonal fruits",
];

export const DISTRICTS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Jessore",
];

export const PAYMENT_METHODS = [
  { id: "sslcommerz", name: "SSLCommerz", description: "Cards, MFS & Net Banking" },
  { id: "bkash", name: "bKash", description: "Mobile Financial Service" },
  { id: "nagad", name: "Nagad", description: "Mobile Financial Service" },
  { id: "stripe", name: "Stripe", description: "International Cards" },
];
