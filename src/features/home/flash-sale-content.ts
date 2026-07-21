import type { Product } from "@/types";

export type FlashSaleContent = {
  enabled: boolean;
  title: string;
  subtitle: string | null;
  shopAllLabel: string;
  shopAllHref: string;
  viewAllLabel: string;
  viewAllHref: string;
  productLimit: number;
  useAutoSale: boolean;
  endsAt: string | null;
  products: Product[];
};

export const DEFAULT_FLASH_SALE_CONTENT: Omit<FlashSaleContent, "products"> = {
  enabled: true,
  title: "Flash Sale",
  subtitle: null,
  shopAllLabel: "View details",
  shopAllHref: "/shop/flash-sale",
  viewAllLabel: "View details",
  viewAllHref: "/shop/flash-sale",
  /** How many products show in the hero sidebar preview */
  productLimit: 3,
  useAutoSale: false,
  endsAt: null,
};
