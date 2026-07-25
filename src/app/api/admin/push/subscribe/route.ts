import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  listPushSubscriptionCount,
  removePushSubscription,
  savePushSubscription,
  type PushSubscriptionJSON,
} from "@/lib/push";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const count = await listPushSubscriptionCount();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<PushSubscriptionJSON>(request, 8_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const count = await savePushSubscription(parsed.data);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Subscription speichern fehlgeschlagen.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{ endpoint?: string }>(request, 4_000);
  if (!parsed.ok || !parsed.data.endpoint) {
    return NextResponse.json({ error: "Endpoint fehlt." }, { status: 400 });
  }

  const count = await removePushSubscription(parsed.data.endpoint);
  return NextResponse.json({ ok: true, count });
}
