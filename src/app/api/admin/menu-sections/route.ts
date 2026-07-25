import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  getFullMenuData,
  saveFullMenuData,
  type FullMenuData,
} from "@/lib/menu-store";
import { persistWarningOrFail } from "@/lib/persist-response";
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
  const menu = await getFullMenuData();
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

  const parsed = await readJsonLimited<Partial<FullMenuData>>(request, 200_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    return NextResponse.json(
      { error: "Mindestens eine Kategorie nötig." },
      { status: 400 },
    );
  }

  try {
    const { menu, persist } = await saveFullMenuData({
      sections: body.sections,
    });
    return persistWarningOrFail({ ...menu }, persist, {
      action: "Speisekarte (alle Gerichte) veröffentlicht",
      detail: `${menu.sections.length} Kategorien · ${menu.sections.reduce((n, s) => n + s.items.length, 0)} Gerichte`,
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
