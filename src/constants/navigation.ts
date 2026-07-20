import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      {
        label: "Honey",
        href: "/shop?category=honey",
        description: "Forest & flower honey, pure and traceable.",
        image: "/images/categories/organic-honey.png",
        icon: "droplets",
        featured: true,
      },
      {
        label: "Organic Food",
        href: "/shop?filter=organic",
        description: "Clean staples from trusted Bangladeshi farms.",
        image: "/images/categories/organic-foods.png",
        icon: "leaf",
        featured: true,
      },
      {
        label: "Traditional Sweets",
        href: "/shop?q=sweets",
        description: "Heritage mishti for everyday and celebration.",
        image: "/images/categories/heritage-sweets.png",
        icon: "candy",
      },
      {
        label: "Fashion",
        href: "/shop?category=traditional-clothing",
        description: "Panjabi, Jamdani, and modern heritage wear.",
        image: "/images/traditional-clothing-v2.png",
        icon: "shirt",
      },
      {
        label: "Handicrafts",
        href: "/collections/handmade",
        description: "Artisan-made pieces with lasting character.",
        image: "/images/categories/gift-boxes.png",
        icon: "sparkles",
      },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Farmers", href: "/farmers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  quick: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "Blog", href: "/blog" },
    { label: "Farmers", href: "/farmers" },
  ],
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Honey", href: "/shop?category=honey" },
    { label: "Organic Foods", href: "/shop?filter=organic" },
    { label: "Traditional Sweets", href: "/shop?q=sweets" },
    { label: "Fashion", href: "/shop?category=traditional-clothing" },
    { label: "Handicrafts", href: "/collections/handmade" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQs", href: "/faqs" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Farmers", href: "/farmers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
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
