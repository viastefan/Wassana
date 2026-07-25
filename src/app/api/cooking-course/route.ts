import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  getCookingCourse,
  saveCookingCourse,
  sanitizeCourseImage,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { persistWarningOrFail } from "@/lib/persist-response";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const course = await getCookingCourse();
  return NextResponse.json(course, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  const jar = await cookies();
  const token = jar.get(COOKING_COURSE_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    active?: boolean;
    date?: string;
    title?: string;
    teaser?: string;
    image?: string;
    pageTitle?: string;
    pageText?: string;
    price?: string;
    duration?: string;
    startTime?: string;
    maxParticipants?: string;
    locationNote?: string;
    includes?: string;
    whatToBring?: string;
    level?: string;
    dishFocus?: string;
  }>(request, 40_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json(
      { error: "Bitte ein gültiges Datum wählen." },
      { status: 400 },
    );
  }

  try {
    const { course, persist } = await saveCookingCourse({
      active: Boolean(body.active),
      date: body.date,
      title: body.title || "Thai Kochkurs",
      teaser: body.teaser || "",
      image: sanitizeCourseImage(body.image),
      pageTitle: body.pageTitle || "",
      pageText: body.pageText || "",
      price: body.price || "",
      duration: body.duration || "",
      startTime: body.startTime || "",
      maxParticipants: body.maxParticipants || "",
      locationNote: body.locationNote || "",
      includes: body.includes || "",
      whatToBring: body.whatToBring || "",
      level: body.level || "",
      dishFocus: body.dishFocus || "",
    });

    return persistWarningOrFail({ ...course }, persist, {
      action: course.active
        ? "Kochkurs live veröffentlicht"
        : "Kochkurs gespeichert",
      detail: `${course.title || "Kochkurs"} · ${course.date}${course.active ? " · Widget live" : " · Widget aus"}`,
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
