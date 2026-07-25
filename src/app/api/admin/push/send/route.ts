import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { sendPushToAll } from "@/lib/push";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    title?: string;
    body?: string;
    url?: string;
    tag?: string;
  }>(request, 8_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!parsed.data.title?.trim() || !parsed.data.body?.trim()) {
    return NextResponse.json(
      { error: "Titel und Text sind Pflicht." },
      { status: 400 },
    );
  }

  const result = await sendPushToAll({
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url || "/admin",
    tag: parsed.data.tag || "news",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, sent: result.sent, failed: result.failed },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
