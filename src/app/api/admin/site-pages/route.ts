import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { persistWarningOrFail } from "@/lib/persist-response";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";
import {
  getSitePages,
  saveSitePages,
  type SitePages,
} from "@/lib/site-pages";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const pages = await getSitePages();
  return NextResponse.json(pages, {
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

  const parsed = await readJsonLimited<SitePages>(request, 250_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const { pages, persist } = await saveSitePages(parsed.data);
    return persistWarningOrFail({ ...pages }, persist, {
      action: "Alle Website-Texte veröffentlicht",
      detail: "Navigation, Seiten, FAQ, Formulare, Cookies",
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
