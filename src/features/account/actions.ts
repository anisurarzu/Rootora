"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
}

export async function createAddress(formData: FormData) {
  const session = await requireSession();

  const label = String(formData.get("label") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!label || !name || !phone || !addressLine1 || !district || !postalCode) {
    return;
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label,
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      district,
      postalCode,
      isDefault,
    },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function deleteAddress(addressId: string) {
  const session = await requireSession();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });

  if (!address) {
    return;
  }

  await prisma.address.delete({ where: { id: addressId } });

  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(addressId: string) {
  const session = await requireSession();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });

  if (!address) {
    return;
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/account/addresses");
}
