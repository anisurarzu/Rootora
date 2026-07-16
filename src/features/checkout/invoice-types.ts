export type InvoiceOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  accessToken: string;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    district: string;
    postalCode: string;
  };
  user: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      sku: string | null;
      unit: string | null;
    };
  }>;
};
