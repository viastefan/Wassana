import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  assertSameOrigin,
  readJsonLimited,
} from "@/lib/security";
import {
  defaultTopBanner,
  getSiteContent,
  saveSiteContent,
  type SiteContent,
} from "@/lib/site-content";

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

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<Partial<SiteContent>>(request, 80_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!body.hero?.lede || !body.meaning) {
    return NextResponse.json(
      { error: "Hero-Text und Bedeutungstext sind Pflicht." },
      { status: 400 },
    );
  }

  const fallbackBanner = defaultTopBanner();

  try {
    const { content, persist } = await saveSiteContent({
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
        popupTitle: body.studentLunch?.popupTitle || "",
        popupLead: body.studentLunch?.popupLead || "",
        popupBody: body.studentLunch?.popupBody || "",
        popupBullets: body.studentLunch?.popupBullets || "",
        popupPrice: body.studentLunch?.popupPrice || "",
        popupNote: body.studentLunch?.popupNote || "",
        popupCtaLabel: body.studentLunch?.popupCtaLabel || "",
        popupCtaHref: body.studentLunch?.popupCtaHref || "",
      },
      topBanner: {
        active: Boolean(body.topBanner?.active),
        text: body.topBanner?.text || "",
        highlight: body.topBanner?.highlight || "",
        linkHref: body.topBanner?.linkHref || fallbackBanner.linkHref,
        linkLabel: body.topBanner?.linkLabel || "",
        backgroundColor:
          body.topBanner?.backgroundColor || fallbackBanner.backgroundColor,
        textColor: body.topBanner?.textColor || fallbackBanner.textColor,
        highlightColor:
          body.topBanner?.highlightColor || fallbackBanner.highlightColor,
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

    return NextResponse.json({
      ...content,
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
