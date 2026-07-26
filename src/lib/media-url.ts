/** Client-safe media URL helpers (no Node/fs). */

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const MAX_URL_LEN = 500;

/** Absolute site URL or relative /images|/uploads path suitable for next/image. */
export function sanitizeMediaUrl(value: string | undefined | null): string {
  const next = String(value || "").trim().slice(0, MAX_URL_LEN);
  if (!next) return "";

  if (next.startsWith("/images/") || next.startsWith("/uploads/")) {
    if (next.includes("..") || next.includes("//") || next.includes("\\")) {
      return "";
    }
    return next;
  }

  try {
    const url = new URL(next);
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(BLOB_HOST_SUFFIX) &&
      !url.hostname.includes("..")
    ) {
      return url.toString().slice(0, MAX_URL_LEN);
    }
  } catch {
    return "";
  }

  return "";
}

/** Resolve a media path/URL against the public site origin for JSON-LD etc. */
export function absoluteMediaUrl(siteUrl: string, src: string): string {
  const clean = String(src || "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${clean.startsWith("/") ? clean : `/${clean}`}`;
}
