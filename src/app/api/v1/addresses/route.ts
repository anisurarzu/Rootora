import { z } from "zod";
import { requireApiSession, parseJsonBody } from "@/lib/api/auth";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  name: z.string().min(2),
  phone: z.string().min(8),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().nullable(),
  district: z.string().min(2),
  postalCode: z.string().min(2),
  isDefault: z.boolean().optional(),
});

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });

    return apiOk(
      addresses.map((address) => ({
        id: address.id,
        label: address.label,
        name: address.name,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        district: address.district,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const body = await parseJsonBody(request);
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiHttpError(
        parsed.error.issues[0]?.message ?? "Invalid address",
        400,
        { code: "VALIDATION_ERROR" }
      );
    }

    const data = parsed.data;
    const count = await prisma.address.count({ where: { userId: user.id } });
    const isDefault = data.isDefault ?? count === 0;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label || "Home",
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        district: data.district,
        postalCode: data.postalCode,
        isDefault,
      },
    });

    return apiOk(
      {
        id: address.id,
        label: address.label,
        name: address.name,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        district: address.district,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      },
      { status: 201, message: "Address created" }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
