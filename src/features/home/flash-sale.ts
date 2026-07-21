import {
  DEFAULT_FLASH_SALE_CONTENT,
  type FlashSaleContent,
} from "@/features/home/flash-sale-content";
import {
  getStorefrontProductsByIds,
  getStorefrontSaleProducts,
} from "@/features/products/storefront-queries";
import { prisma } from "@/lib/prisma";

export type { FlashSaleContent } from "@/features/home/flash-sale-content";
export { DEFAULT_FLASH_SALE_CONTENT } from "@/features/home/flash-sale-content";

export async function ensureFlashSaleDefaults() {
  const existing = await prisma.flashSaleSettings.findUnique({
    where: { id: "default" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              images: true,
              price: true,
              salePrice: true,
              discountAmount: true,
              discountType: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (existing) return existing;

  return prisma.flashSaleSettings.create({
    data: {
      id: "default",
      enabled: DEFAULT_FLASH_SALE_CONTENT.enabled,
      title: DEFAULT_FLASH_SALE_CONTENT.title,
      subtitle: DEFAULT_FLASH_SALE_CONTENT.subtitle,
      shopAllLabel: DEFAULT_FLASH_SALE_CONTENT.shopAllLabel,
      shopAllHref: DEFAULT_FLASH_SALE_CONTENT.shopAllHref,
      viewAllLabel: DEFAULT_FLASH_SALE_CONTENT.viewAllLabel,
      viewAllHref: DEFAULT_FLASH_SALE_CONTENT.viewAllHref,
      productLimit: DEFAULT_FLASH_SALE_CONTENT.productLimit,
      useAutoSale: DEFAULT_FLASH_SALE_CONTENT.useAutoSale,
      endsAt: null,
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              images: true,
              price: true,
              salePrice: true,
              discountAmount: true,
              discountType: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

export async function getFlashSaleContent(): Promise<FlashSaleContent> {
  try {
    const settings = await ensureFlashSaleDefaults();

    if (!settings.enabled) {
      return {
        ...DEFAULT_FLASH_SALE_CONTENT,
        enabled: false,
        title: settings.title,
        subtitle: settings.subtitle,
        shopAllLabel: settings.shopAllLabel,
        shopAllHref: settings.shopAllHref,
        viewAllLabel: settings.viewAllLabel,
        viewAllHref: settings.viewAllHref,
        productLimit: settings.productLimit,
        useAutoSale: settings.useAutoSale,
        endsAt: settings.endsAt?.toISOString() ?? null,
        products: [],
      };
    }

    const previewLimit = Math.min(Math.max(settings.productLimit || 3, 1), 12);
    const activeItems = settings.items
      .filter((item) => item.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Load all curated products — sidebar previews a subset; /shop/flash-sale shows all
    let products =
      activeItems.length > 0
        ? await getStorefrontProductsByIds(
            activeItems.map((item) => item.productId),
            100
          )
        : [];

    if (products.length === 0 && settings.useAutoSale) {
      products = await getStorefrontSaleProducts(previewLimit);
    }

    return {
      enabled: settings.enabled,
      title: settings.title,
      subtitle: settings.subtitle,
      shopAllLabel: settings.shopAllLabel,
      shopAllHref: settings.shopAllHref || "/shop/flash-sale",
      viewAllLabel: settings.viewAllLabel,
      viewAllHref: settings.viewAllHref || "/shop/flash-sale",
      productLimit: previewLimit,
      useAutoSale: settings.useAutoSale,
      endsAt: settings.endsAt?.toISOString() ?? null,
      products,
    };
  } catch (error) {
    console.error("Failed to load flash sale content", error);
    const products = await getStorefrontSaleProducts(6).catch(() => []);
    return {
      ...DEFAULT_FLASH_SALE_CONTENT,
      products,
    };
  }
}

export async function getFlashSaleForAdmin() {
  return ensureFlashSaleDefaults();
}
