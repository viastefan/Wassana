import type { Metadata } from "next";
import { JsonLdBreadcrumbs, JsonLdMenu } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { MenuPdfDownload } from "@/components/MenuPdfDownload";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getPublicMenuSections } from "@/lib/menu-store";
import { getSiteContent } from "@/lib/site-content";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Speisekarte Thai Imbiss Landshut",
  description:
    "Speisekarte von Wassana in Landshut: Wochenkarte, Curries, Wok, Suppen, vegetarisch & Getränke. Frisch zubereitet, gerne zum Mitnehmen.",
  alternates: { canonical: "/speisekarte" },
  openGraph: {
    title: "Speisekarte | Wassana Thai Imbiss Landshut",
    description:
      "Wochenkarte und alle Gerichte — Thai Essen in Landshut am Regierungsplatz.",
    url: "/speisekarte",
  },
  robots: { index: true, follow: true },
};

export default async function SpeisekartePage() {
  const [weekly, sections, business] = await Promise.all([
    getWeeklyMenuData(),
    getPublicMenuSections(),
    getResolvedBusiness(),
  ]);

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
        eyebrow="Speisekarte Landshut"
        title="Unsere Gerichte"
        text="Frisch zubereitet in Landshut — Currys, Wok, Suppen und mehr. Gerne auch zum Mitnehmen."
        priority
        height="short"
      />
      <div className="menu-pdf-band">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
              Zum Mitnehmen & Teilen
            </p>
            <p className="mt-1 text-[color:var(--ink)]">
              Die komplette Speisekarte als klares PDF — Wochenkarte und alle
              Gerichte.
            </p>
          </div>
          <MenuPdfDownload label="Speisekarte als PDF" />
        </div>
      </div>
      <SpeisekarteFull menu={weekly} sections={sections} />
    </main>
  );
}
