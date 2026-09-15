import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/site-content";
import { filledWeeklyTableRows } from "@/lib/weekly-menu-store-shared";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Public live snapshot of the CMS the website actually reads.
 * Admin polls this after publish instead of scraping HTML (RSC/CDN false negatives).
 */
export async function GET() {
  const [weekly, content] = await Promise.all([
    getWeeklyMenuData(),
    getSiteContent(),
  ]);

  return NextResponse.json(
    {
      weekly: {
        updatedAt: weekly.updatedAt,
        note: weekly.note,
        table: filledWeeklyTableRows(weekly.table),
      },
      content: {
        updatedAt: content.updatedAt,
        banner: content.topBanner.text,
        highlight: content.topBanner.highlight,
        hours: content.hours.weekdays,
        studentPrice: content.studentLunch.price,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
