import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schüler Mittagessen Landshut",
  description:
    "Schüler- und Azubi-Mittagessen bei Wassana in Landshut: Gericht der Wochenkarte inkl. Softgetränk — günstig, frisch und zum Mitnehmen.",
  alternates: { canonical: "/schueler-mittagessen" },
  openGraph: {
    title: "Schüler Mittagessen Landshut | Wassana",
    description:
      "Mittag für Schüler & Azubis: Gericht inkl. Getränk bei Wassana am Regierungsplatz.",
    url: "/schueler-mittagessen",
  },
  robots: { index: true, follow: true },
};

export default async function SchuelerMittagessenPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);
  const offer = content.studentLunch;

  return (
    <ContentPage
      breadcrumbs={[
        { name: "Start", path: "/" },
        { name: "Schüler-Mittagessen", path: "/schueler-mittagessen" },
      ]}
      eyebrow={offer.eyebrow}
      title={offer.title}
      lead={`${offer.text} ${offer.price}.`}
      image="/images/curry.jpg"
      imageAlt="Schüler-Mittagessen bei Wassana Thai Imbiss in Landshut"
    >
      <ContentBlock title="Das Angebot">
        <p className="text-[color:var(--ink)]">{offer.popupBody || offer.text}</p>
        <p>
          Preis:{" "}
          <strong className="text-[color:var(--red)]">
            {offer.popupPrice || offer.price}
          </strong>
        </p>
        <p>{offer.popupNote || offer.note}</p>
      </ContentBlock>

      <ContentBlock title="Für wen?">
        <p>
          Für Schülerinnen, Schüler und Azubis — gegen Vorlage eines gültigen
          Ausweises. Ideal für die Mittagspause in der Landshuter Innenstadt.
        </p>
      </ContentBlock>

      <ContentBlock title="Wann & wo">
        <p>
          {content.hours.weekdaysLong}. {content.hours.weekend}.
        </p>
        <p>
          {business.street}, {business.zip} {business.city}. Gerne auch zum
          Mitnehmen.
        </p>
      </ContentBlock>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/speisekarte#wochenkarte" className="btn-primary">
          Zur Wochenkarte
        </Link>
        <Link href="/mitnehmen" className="btn-gold">
          Mitnehmen
        </Link>
        <a href={business.phoneHref} className="btn-gold">
          Anrufen
        </a>
      </div>
    </ContentPage>
  );
}
