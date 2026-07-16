import { apiOk, apiOptions, handleApiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET() {
  try {
    return apiOk({
      name: "ROOTORA Mobile API",
      version: "v1",
      status: "ok",
      endpoints: {
        products: "/api/v1/products",
        productDetail: "/api/v1/products/:slug",
        categories: "/api/v1/categories",
        cart: "/api/v1/cart",
        checkout: "/api/v1/checkout",
        orders: "/api/v1/orders",
        orderDetail: "/api/v1/orders/:id",
        addresses: "/api/v1/addresses",
        auth: "/api/auth/*",
      },
      auth: {
        type: "Bearer or cookie session",
        header: "Authorization: Bearer <session_token>",
        signIn: "POST /api/auth/sign-in/email",
        tokenHeader: "set-auth-token",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
