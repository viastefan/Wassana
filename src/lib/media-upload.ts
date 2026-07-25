/** Server-side image upload: Vercel Blob (live) or public/uploads (local). */

import { put } from "@vercel/blob";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

function sanitizeFolder(folder: string) {
  const clean = String(folder || "misc")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return clean || "misc";
}

export function validateUploadFile(file: File): string | null {
  if (!file || typeof file.size !== "number") {
    return "Keine Datei gewählt.";
  }
  if (file.size <= 0) {
    return "Datei ist leer.";
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return "Bild ist zu groß (max. 4 MB).";
  }
  const type = String(file.type || "").toLowerCase();
  if (!ALLOWED_TYPES.has(type)) {
    return "Nur JPG, PNG, WebP oder GIF.";
  }
  return null;
}

export async function saveUploadedImage(
  file: File,
  folder = "misc",
): Promise<{ url: string }> {
  const typeError = validateUploadFile(file);
  if (typeError) {
    throw new Error(typeError);
  }

  const type = String(file.type || "image/jpeg").toLowerCase();
  const ext = EXT_BY_TYPE[type] || "jpg";
  const safeFolder = sanitizeFolder(folder);
  const stamp = Date.now().toString(36);
  const rand = randomBytes(4).toString("hex");
  const filename = `${stamp}-${rand}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const token = blobToken();
  if (token) {
    const pathname = `cms/uploads/${safeFolder}/${filename}`;
    const result = await put(pathname, bytes, {
      access: "public",
      token,
      contentType: type === "image/jpg" ? "image/jpeg" : type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return { url: result.url };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Bild-Upload braucht BLOB_READ_WRITE_TOKEN in Vercel (Storage).",
    );
  }

  const rel = `/uploads/${safeFolder}/${filename}`;
  const abs = path.join(
    process.cwd(),
    "public",
    "uploads",
    safeFolder,
    filename,
  );
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, bytes);
  return { url: rel };
}
