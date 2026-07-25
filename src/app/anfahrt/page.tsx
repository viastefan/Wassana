import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { LocationSection } from "@/components/LocationSection";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anfahrt Thai Imbiss Landshut",
  description:
    "Anfahrt zu Wassana Thai Imbiss in Landshut: Regierungsplatz 542, zentral in der Altstadt. Route, Öffnungszeiten und Kontakt.",
  alternates: { canonical: "/anfahrt" },
  openGraph: {
    title: "Anfahrt | Wassana Thai Imbiss Landshut",
    description:
      "Regierungsplatz 542, 84028 Landshut — so findet ihr uns.",
    url: "/anfahrt",
  },
  robots: { index: true, follow: true },
};

export default async function AnfahrtPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  return (
    <>
      <ContentPage
        breadcrumbs={[
          { name: "Start", path: "/" },
          { name: "Anfahrt", path: "/anfahrt" },
        ]}
        eyebrow="Standort Landshut"
        title="So findet ihr uns"
        lead={`${business.street}, ${business.zip} ${business.city} — im Gewerbehaus am Regierungsplatz.`}
        image="/images/laden-fassade.jpg"
        imageAlt="Fassade von Wassana Thai Imbiss am Regierungsplatz in Landshut"
      >
        <ContentBlock title="Adresse">
          <p className="text-[color:var(--ink)]">
            {business.fullName}
            <br />
            {business.street}
            <br />
            {business.zip} {business.city}
          </p>
          <p>
            Telefon:{" "}
            <a href={business.phoneHref} className="text-[color:var(--red)]">
              {business.phone}
            </a>
          </p>
        </ContentBlock>

        <ContentBlock title="Öffnungszeiten">
          <p>
            {content.hours.weekdaysLong}. {content.hours.weekend}.
          </p>
        </ContentBlock>

        <ContentBlock title="Mit dem Auto oder zu Fuß">
          <p>
            Der Regierungsplatz liegt zentral in Landshut. Zu Fuß aus der
            Altstadt gut erreichbar; mit dem Auto über die üblichen Zufahrten
            zur Innenstadt. Für die genaue Route nutzt am besten Google Maps.
          </p>
        </ContentBlock>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={business.maps.directions}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Route öffnen
          </a>
          <a href={business.phoneHref} className="btn-gold">
            Anrufen
          </a>
          <Link href="/kontakt" className="btn-gold">
            Kontakt
          </Link>
        </div>
      </ContentPage>

      <LocationSection location={content.location} hours={content.hours} />
    </>
  );
}
