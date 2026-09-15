import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  buildPublishDiagnostic,
  envDiagnostics,
} from "@/lib/admin-support";
import { probeBlobStore } from "@/lib/persist-json";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const probe = await probeBlobStore();
  const env = {
    ...envDiagnostics(),
    blob: probe.usable,
    blobSuspended: probe.suspended,
  };
  const report = buildPublishDiagnostic({
    action: "Statusprüfung",
    ok: !env.vercel || env.blob,
    error: env.vercel && !env.blob
      ? probe.suspended
        ? "Der Live-Speicher ist gesperrt. Neuen Blob-Store anlegen, dem Projekt zuweisen und neu veröffentlichen."
        : "BLOB_READ_WRITE_TOKEN fehlt — Live-Veröffentlichung auf .de ist blockiert."
      : undefined,
  });

  return NextResponse.json(
    { report, env },
    { headers: { "Cache-Control": "no-store" } },
  );
}
