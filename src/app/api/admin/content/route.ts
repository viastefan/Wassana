import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { getSiteContent, saveSiteContent, type SiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: Partial<SiteContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  if (!body.hero?.lede || !body.meaning) {
    return NextResponse.json(
      { error: "Hero-Text und Bedeutungstext sind Pflicht." },
      { status: 400 },
    );
  }

  const saved = await saveSiteContent({
    hero: {
      eyebrow: body.hero.eyebrow || "",
      lede: body.hero.lede,
    },
    meaning: body.meaning,
    hours: {
      weekdays: body.hours?.weekdays || "",
      weekdaysLong: body.hours?.weekdaysLong || "",
      weekend: body.hours?.weekend || "",
    },
    studentLunch: {
      eyebrow: body.studentLunch?.eyebrow || "",
      title: body.studentLunch?.title || "",
      text: body.studentLunch?.text || "",
      price: body.studentLunch?.price || "",
      note: body.studentLunch?.note || "",
    },
    location: {
      eyebrow: body.location?.eyebrow || "",
      title: body.location?.title || "",
      text: body.location?.text || "",
    },
    closing: {
      title: body.closing?.title || "Bis bald bei Wassana",
      text: body.closing?.text || "",
    },
  });

  return NextResponse.json(saved);
}
