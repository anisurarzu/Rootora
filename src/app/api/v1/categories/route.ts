import { prisma } from "@/lib/prisma";
import { apiOk, apiOptions, handleApiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    return apiOk(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        productCount: category._count.products,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
