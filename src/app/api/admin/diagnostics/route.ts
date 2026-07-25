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

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const env = envDiagnostics();
  const report = buildPublishDiagnostic({
    action: "Statusprüfung",
    ok: !env.vercel || env.blob,
    error:
      env.vercel && !env.blob
        ? "BLOB_READ_WRITE_TOKEN fehlt — Live-Veröffentlichung auf .de ist blockiert."
        : undefined,
  });

  return NextResponse.json(
    { report, env },
    { headers: { "Cache-Control": "no-store" } },
  );
}
