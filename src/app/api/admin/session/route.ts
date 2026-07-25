import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const ok = verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
  if (!ok) {
    return NextResponse.json(
      { ok: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
