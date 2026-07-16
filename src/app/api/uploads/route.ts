import { NextResponse } from "next/server";
import { getSession, userHasPermission } from "@/lib/auth-server";
import { getUploadProvider, uploadFile } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  const canUpload =
    session?.user &&
    (await userHasPermission(session.user.role, [
      "products.create",
      "products.edit",
      "admin.access",
    ]));

  if (!canUpload) {
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
