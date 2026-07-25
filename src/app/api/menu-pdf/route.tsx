import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getPublicMenuSections } from "@/lib/menu-store";
import { getSiteUrl } from "@/lib/site";
import { SpeisekartePdfDocument } from "@/lib/speisekarte-pdf";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [weekly, sections, business] = await Promise.all([
      getWeeklyMenuData(),
      getPublicMenuSections(),
      getResolvedBusiness(),
    ]);

    const buffer = await renderToBuffer(
      <SpeisekartePdfDocument
        weekly={weekly}
        sections={sections}
        business={business}
        siteUrl={getSiteUrl()}
      />,
    );

    const filename = "Wassana-Speisekarte-Landshut.pdf";
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("menu-pdf", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF konnte nicht erstellt werden.",
      },
      { status: 500 },
    );
  }
}
