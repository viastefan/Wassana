import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
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

  let body: Partial<WeeklyMenuData>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  if (!Array.isArray(body.days) || body.days.length === 0) {
    return NextResponse.json(
      { error: "Wochenkarte braucht mindestens einen Tag." },
      { status: 400 },
    );
  }

  const saved = await saveWeeklyMenuData({
    note: body.note || "",
    days: body.days,
  });

  return NextResponse.json(saved);
}
