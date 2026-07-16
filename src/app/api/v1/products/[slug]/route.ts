import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/api/serializers";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "PUBLISHED",
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        farmer: { select: { id: true, name: true, slug: true } },
        variants: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new ApiHttpError("Product not found", 404, { code: "NOT_FOUND" });
    }

    return apiOk(serializeProduct(product));
  } catch (error) {
    return handleApiError(error);
  }
}
