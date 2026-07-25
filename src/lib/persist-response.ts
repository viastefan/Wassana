import { NextResponse } from "next/server";
import type { PersistResult } from "@/lib/persist-json";

/** On Vercel, /tmp alone is not enough — CMS must hit disk or GitHub. */
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
  if (!persist.durable && isEphemeralHosting()) {
    return NextResponse.json(
      {
        ...body,
        error:
          persist.error ||
          "Nicht dauerhaft gespeichert. Bitte GITHUB_TOKEN in Vercel setzen und erneut speichern.",
        warning: persist.error,
        persist: {
          disk: persist.disk,
          tmp: persist.tmp,
          github: persist.github,
          durable: persist.durable,
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ...body,
    warning: persist.durable ? undefined : persist.error,
    persist: {
      disk: persist.disk,
      tmp: persist.tmp,
      github: persist.github,
      durable: persist.durable,
    },
  });
}
