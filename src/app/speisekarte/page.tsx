import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  JsonLdBreadcrumbs,
  JsonLdMenu,
  JsonLdWebPage,
} from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { MenuPdfDownload } from "@/components/MenuPdfDownload";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { StudentLunch } from "@/components/StudentLunch";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getPublicMenuSections } from "@/lib/menu-store";
import { pageMetadata } from "@/lib/seo-metadata";
import { getSiteContent } from "@/lib/site-content";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Speisekarte Thai Imbiss Landshut",
  description:
    "Speisekarte von Wassana in Landshut: beliebte Gerichte der Woche, Curries, Wok, Suppen, vegetarisch & Getränke. Frisch zubereitet, gerne zum Mitnehmen.",
  path: "/speisekarte",
  keywords: [
    "Speisekarte Thai Landshut",
    "Thai Curry Landshut",
    "Pad Thai Landshut",
    "Massaman Curry Landshut",
    "Thai Essen Landshut",
  ],
  image: {
    url: "/images/curry.jpg",
    width: 1600,
    height: 1067,
    alt: "Curry-Gerichte auf der Speisekarte bei Wassana in Landshut",
  },
});

const crumbs = [
  { name: "Start", path: "/" },
  { name: "Speisekarte", path: "/speisekarte" },
];

export default async function SpeisekartePage() {
  const [weekly, sections, business, content] = await Promise.all([
    getWeeklyMenuData(),
    getPublicMenuSections(),
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  return (
    <main>
      <JsonLdBreadcrumbs items={crumbs} />
      <JsonLdWebPage
        name="Speisekarte Thai Imbiss Landshut"
        description="Thai Speisekarte von Wassana in Landshut — Curries, Wok, Suppen, vegetarisch und Getränke."
        path="/speisekarte"
      />
      <JsonLdMenu sections={sections} businessName={business.shortName} />
      <MediaBand
        src="/images/curry.jpg"
        alt="Curry-Gerichte auf der Speisekarte bei Wassana Thai Imbiss in Landshut"
        eyebrow="Speisekarte Landshut"
        title="Thai Speisekarte"
        text="Frisch zubereitet in Landshut — Currys, Wok, Suppen und mehr. Gerne auch zum Mitnehmen."
        priority
        height="short"
      />
      <div className="mx-auto max-w-6xl px-5 pt-4 md:px-8">
        <Breadcrumbs items={crumbs} />
      </div>
      <StudentLunch compact offer={content.studentLunch} />
      <div className="menu-pdf-band">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
              Zum Mitnehmen & Teilen
            </p>
            <p className="mt-1 text-[color:var(--ink)]">
              Die komplette Speisekarte als klares PDF — beliebte Gerichte der
              Woche und alle Klassiker.
            </p>
          </div>
          <MenuPdfDownload label="Speisekarte als PDF" />
        </div>
      </div>
      <SpeisekarteFull menu={weekly} sections={sections} />
    </main>
  );
}
