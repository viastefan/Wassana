import type { Metadata } from "next";
import { JsonLdBreadcrumbs, JsonLdMenu } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { StudentLunch } from "@/components/StudentLunch";
import { getResolvedBusiness } from "@/lib/business-profile";
import { menuSections } from "@/lib/menu";
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
  const [content, weekly, business] = await Promise.all([
    getSiteContent(),
    getWeeklyMenuData(),
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
      <JsonLdMenu sections={menuSections} businessName={business.shortName} />
      <MediaBand
        src="/images/curry.jpg"
        alt="Curry-Gerichte auf der Speisekarte bei Wassana Thai Imbiss in Landshut"
        eyebrow="Speisekarte Landshut"
        title="Unsere Gerichte"
        text="Frisch zubereitet in Landshut — Currys, Wok, Suppen und mehr. Gerne auch zum Mitnehmen."
        priority
        height="short"
      />
      <StudentLunch compact offer={content.studentLunch} />
      <SpeisekarteFull menu={weekly} />
    </main>
  );
}
