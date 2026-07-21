import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUploadProvider, uploadFile } from "@/lib/uploads";

export const runtime = "nodejs";

/** Authenticated customers can upload a profile avatar. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const result = await uploadFile(file, { avatar: true, folder: "avatars" });

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
