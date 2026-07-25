import type { Metadata } from "next";
import { JsonLdBreadcrumbs, JsonLdMenu } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { MenuPdfDownload } from "@/components/MenuPdfDownload";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { StudentLunch } from "@/components/StudentLunch";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getPublicMenuSections } from "@/lib/menu-store";
import { getSiteContent } from "@/lib/site-content";
import { getSitePages } from "@/lib/site-pages";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Speisekarte Thai Imbiss Landshut",
  description:
    "Speisekarte von Wassana in Landshut: beliebte Gerichte der Woche, Curries, Wok, Suppen, vegetarisch & Getränke. Frisch zubereitet, gerne zum Mitnehmen.",
  alternates: { canonical: "/speisekarte" },
  openGraph: {
    title: "Speisekarte | Wassana Thai Imbiss Landshut",
    description:
      "Beliebte Gerichte der Woche und alle Klassiker — Thai Essen in Landshut am Regierungsplatz.",
    url: "/speisekarte",
  },
  robots: { index: true, follow: true },
};

export default async function SpeisekartePage() {
  const [weekly, sections, business, content, pages] = await Promise.all([
    getWeeklyMenuData(),
    getPublicMenuSections(),
    getResolvedBusiness(),
    getSiteContent(),
    getSitePages(),
  ]);
  const copy = pages.speisekarte;

  return (
    <main>
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "Speisekarte", path: "/speisekarte" },
        ]}
      />
      <JsonLdMenu sections={sections} businessName={business.shortName} />
      <MediaBand
        src="/images/curry.jpg"
        alt="Curry-Gerichte auf der Speisekarte bei Wassana Thai Imbiss in Landshut"
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        text={copy.heroText}
        priority
        height="short"
      />
      <StudentLunch compact offer={content.studentLunch} />
      <div className="menu-pdf-band">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
              {copy.pdfEyebrow}
            </p>
            <p className="mt-1 text-[color:var(--ink)]">{copy.pdfText}</p>
          </div>
          <MenuPdfDownload label={copy.pdfCta} />
        </div>
      </div>
      <SpeisekarteFull
        menu={weekly}
        sections={sections}
        labels={pages.speisekarteUi}
        chipWeekly={copy.chipWeekly}
        chipPdf={copy.chipPdf}
        pdfSaveLabel={copy.pdfCta}
      />
    </main>
  );
}
