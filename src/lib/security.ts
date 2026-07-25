/** Shared hardening helpers for API routes. */

const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 5000;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** Simple sliding window rate limit (per serverless instance). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();

  if (RATE_BUCKETS.size > MAX_BUCKETS) {
    for (const [bucketKey, value] of RATE_BUCKETS) {
      if (value.resetAt <= now) RATE_BUCKETS.delete(bucketKey);
    }
  }

  const current = RATE_BUCKETS.get(key);

  if (!current || current.resetAt <= now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

export function sanitizeText(value: string, maxLen: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n|\r|\n/g, "\n")
    .trim()
    .slice(0, maxLen);
}

/** Prevent header injection in email subjects / names. */
export function sanitizeHeader(value: string, maxLen: number): string {
  return value
    .replace(/[\r\n\u0000]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function isValidEmail(value: string): boolean {
  if (value.length < 5 || value.length > 160) return false;
  if (value.includes("\n") || value.includes("\r")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * CSRF / origin check for browser POSTs.
 * Requires Origin or Sec-Fetch-Site when present; rejects cross-site.
 */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (secFetchSite === "cross-site" || secFetchSite === "none") {
    // "none" can be legitimate for user-initiated navigations, but not for
    // credentialed JSON API calls from our forms — those send same-origin/same-site.
    if (secFetchSite === "cross-site") return false;
  }

  if (!host) return false;

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // Same-origin fetch may omit Origin; allow only same-site / same-origin signals.
  if (
    secFetchSite === "same-origin" ||
    secFetchSite === "same-site" ||
    !secFetchSite
  ) {
    return true;
  }

  return false;
}

/** Reject oversized JSON bodies early (bytes). */
export async function readJsonLimited<T>(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, error: "Anfrage zu groß." };
  }

  const raw = await request.text();
  if (raw.length > maxBytes) {
    return { ok: false, error: "Anfrage zu groß." };
  }

  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return { ok: false, error: "Ungültige Anfrage." };
  }
}
