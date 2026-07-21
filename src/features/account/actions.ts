"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/features/admin/types";
import { requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const imageRaw = String(formData.get("image") ?? "").trim();

  if (!name) {
    return { success: false, error: "Name is required." };
  }

  if (name.length > 120) {
    return { success: false, error: "Name is too long." };
  }

  if (phone && phone.length > 32) {
    return { success: false, error: "Phone number is too long." };
  }

  let image: string | null | undefined = undefined;
  if (formData.has("image")) {
    if (!imageRaw) {
      image = null;
    } else if (
      imageRaw.startsWith("/uploads/avatars/") ||
      imageRaw.startsWith("https://res.cloudinary.com/") ||
      imageRaw.startsWith("https://lh3.googleusercontent.com/")
    ) {
      image = imageRaw;
    } else {
      return { success: false, error: "Invalid profile image." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
      ...(image !== undefined ? { image } : {}),
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");

  return { success: true, message: "Profile updated." };
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
