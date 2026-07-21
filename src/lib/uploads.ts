import { createHash, randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
]);
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type UploadFolder = "products" | "avatars";

export type UploadResult = {
  url: string;
  provider: "cloudinary" | "local";
  publicId?: string;
};

export type UploadOptions = {
  folder?: UploadFolder;
  /** Stricter image-only avatar uploads */
  avatar?: boolean;
};

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = cloudinarySignature({ folder, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary upload failed: ${details}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  return {
    url: data.secure_url,
    provider: "cloudinary",
    publicId: data.public_id,
  };
}

async function uploadLocally(
  file: File,
  folder: UploadFolder
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || ".bin";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    provider: "local",
  };
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const folder = options.folder ?? (options.avatar ? "avatars" : "products");
  const maxSize = options.avatar ? MAX_AVATAR_SIZE : MAX_FILE_SIZE;
  const allowed = options.avatar ? ALLOWED_AVATAR_TYPES : ALLOWED_TYPES;

  if (file.size > maxSize) {
    throw new Error(
      options.avatar
        ? "Image exceeds the 2MB limit"
        : "File exceeds the 8MB limit"
    );
  }

  if (!allowed.has(file.type)) {
    throw new Error(
      options.avatar
        ? "Use a JPG, PNG, or WebP image"
        : "Unsupported file type"
    );
  }

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file, `rootora/${folder}`);
  }

  return uploadLocally(file, folder);
}

export function getUploadProvider() {
  return isCloudinaryConfigured() ? "cloudinary" : "local";
}

/**
 * Extract Cloudinary public_id from a delivery URL under our cloud + rootora/ folder.
 * e.g. .../image/upload/v123/rootora/products/abc.jpg → rootora/products/abc
 */
export function getCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
      return null;
    }

    const uploadIndex = parsed.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let remainder = parsed.pathname.slice(uploadIndex + "/upload/".length);
    // Drop version segment: v123456/
    remainder = remainder.replace(/^v\d+\//, "");
    // Drop common transformation segments (e.g. w_200,c_fill/)
    while (/^[a-z]+_[^/]+(?:,[^/]+)*\//i.test(remainder)) {
      remainder = remainder.replace(/^[a-z]+_[^/]+(?:,[^/]+)*\//i, "");
    }

    const withoutExt = remainder.replace(/\.[a-z0-9]+$/i, "");
    if (!withoutExt.startsWith("rootora/")) {
      return null;
    }

    return withoutExt;
  } catch {
    return null;
  }
}

async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw"
) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = cloudinarySignature(
    { public_id: publicId, timestamp },
    apiSecret
  );

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary delete failed: ${details}`);
  }

  const data = (await response.json()) as { result?: string };
  return data.result === "ok" || data.result === "not found";
}

async function deleteLocalUpload(url: string) {
  if (!url.startsWith("/uploads/")) return false;
  const relative = url.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", relative);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!filePath.startsWith(uploadsRoot)) {
    throw new Error("Invalid local upload path");
  }
  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
    throw error;
  }
}

/**
 * Delete an uploaded asset from Cloudinary (or local /uploads).
 * External pasted URLs are ignored safely.
 */
export async function deleteUploadedFile(url: string): Promise<{
  deleted: boolean;
  provider: "cloudinary" | "local" | "none";
}> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { deleted: false, provider: "none" };
  }

  if (trimmed.startsWith("/uploads/")) {
    await deleteLocalUpload(trimmed);
    return { deleted: true, provider: "local" };
  }

  if (!isCloudinaryConfigured() || !trimmed.includes("res.cloudinary.com")) {
    return { deleted: false, provider: "none" };
  }

  const publicId = getCloudinaryPublicId(trimmed);
  if (!publicId) {
    return { deleted: false, provider: "none" };
  }

  const resourceType: "image" | "video" | "raw" = trimmed.includes("/video/")
    ? "video"
    : trimmed.includes("/raw/")
      ? "raw"
      : "image";

  const ok = await destroyCloudinaryAsset(publicId, resourceType);
  return { deleted: ok, provider: "cloudinary" };
}
