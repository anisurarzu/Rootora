import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

type AddItemOptions = {
  variantId?: string;
  variantLabel?: string;
};

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    options?: AddItemOptions
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

function sameLine(item: CartItem, productId: string, variantId?: string) {
  return item.product.id === productId && item.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, options) => {
        const variantId = options?.variantId;
        const variantLabel = options?.variantLabel;

        set((state) => {
          const existing = state.items.find((item) =>
            sameLine(item, product.id, variantId)
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                sameLine(item, product.id, variantId)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, variantId, variantLabel },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !sameLine(item, productId, variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            sameLine(item, productId, variantId)
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),
    }),
    { name: "rootora-cart" }
  )
);
