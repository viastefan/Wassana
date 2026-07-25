import { NextResponse } from "next/server";
import type { PersistResult } from "@/lib/persist-json";

/** On Vercel, /tmp alone is not enough — CMS must hit Blob, disk, or GitHub. */
export function isEphemeralHosting() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

/**
 * Returns a 503 JSON response when a save is not durable on Vercel.
 * Callers should spread their payload fields into `body`.
 */
export function persistWarningOrFail<T extends Record<string, unknown>>(
  body: T,
  persist: PersistResult,
) {
  const persistView = {
    disk: persist.disk,
    tmp: persist.tmp,
    blob: persist.blob,
    github: persist.github,
    durable: persist.durable,
  };

  if (!persist.durable && isEphemeralHosting()) {
    return NextResponse.json(
      {
        ...body,
        error:
          persist.error ||
          "Nicht dauerhaft gespeichert. BLOB_READ_WRITE_TOKEN in Vercel prüfen.",
        warning: persist.error,
        persist: persistView,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ...body,
    warning: persist.durable ? undefined : persist.error,
    persist: persistView,
  });
}
