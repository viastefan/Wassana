import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";
import {
  getWeeklyMenuData,
  saveWeeklyMenuData,
  type WeeklyMenuData,
} from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const menu = await getWeeklyMenuData();
  return NextResponse.json(menu, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<Partial<WeeklyMenuData>>(
    request,
    120_000,
  );
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!Array.isArray(body.days) || body.days.length === 0) {
    return NextResponse.json(
      { error: "Wochenkarte braucht mindestens einen Tag." },
      { status: 400 },
    );
  }

  try {
    const { menu, persist } = await saveWeeklyMenuData({
      note: body.note || "",
      days: body.days,
    });

    return NextResponse.json({
      ...menu,
      warning: persist.durable ? undefined : persist.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Speichern fehlgeschlagen.",
      },
      { status: 503 },
    );
  }
}
