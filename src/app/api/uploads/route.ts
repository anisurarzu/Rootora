import { NextResponse } from "next/server";
import { getSession, userHasPermission } from "@/lib/auth-server";
import {
  deleteUploadedFile,
  getUploadProvider,
  uploadFile,
} from "@/lib/uploads";

export const runtime = "nodejs";

async function canManageUploads() {
  const session = await getSession();
  if (!session?.user) return false;
  return userHasPermission(session.user.role, [
    "products.create",
    "products.edit",
    "content.manage",
    "admin.access",
  ]);
}

export async function POST(request: Request) {
  if (!(await canManageUploads())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const result = await uploadFile(file);

    return NextResponse.json({
      ...result,
      provider: getUploadProvider(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await canManageUploads())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      url?: string;
    } | null;
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const result = await deleteUploadedFile(url);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Delete failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
