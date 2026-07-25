import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  getCookingCourse,
  saveCookingCourse,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";

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

  let body: {
    active?: boolean;
    date?: string;
    title?: string;
    teaser?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json(
      { error: "Bitte ein gültiges Datum wählen." },
      { status: 400 },
    );
  }

  const course = await saveCookingCourse({
    active: Boolean(body.active),
    date: body.date,
    title: body.title || "Thai Kochkurs",
    teaser: body.teaser || "",
  });

  return NextResponse.json(course);
}
