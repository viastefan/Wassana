import { NextResponse } from "next/server";
import { getCookingCourse } from "@/lib/cooking-course";

export const dynamic = "force-dynamic";

/** Read-only: the public promo widget loads the active course from here. */
export async function GET() {
  const course = await getCookingCourse();
  return NextResponse.json(course, {
    headers: { "Cache-Control": "no-store" },
  });
}
