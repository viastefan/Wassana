import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { ImageStrip } from "@/components/Media";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Über uns – Wassana Thai Imbiss Landshut",
  description:
    "Über Wassana in Landshut: Bedeutung von Glück und gutem Schicksal, frische Thai-Küche am Regierungsplatz und unser Imbiss zum Mitnehmen.",
  alternates: { canonical: "/ueber-uns" },
  openGraph: {
    title: "Über Wassana | Thai Imbiss Landshut",
    description:
      "Glück und gutes Schicksal — authentische Thai-Küche am Regierungsplatz.",
    url: "/ueber-uns",
  },
  robots: { index: true, follow: true },
};

export default async function UeberUnsPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  return (
    <>
      <ContentPage
        breadcrumbs={[
          { name: "Start", path: "/" },
          { name: "Über uns", path: "/ueber-uns" },
        ]}
        eyebrow="Wassana Landshut"
        title="Über uns"
        lead="Frisch gekocht am Regierungsplatz — mit dem Wunsch nach Glück und gutem Schicksal."
        image="/images/laden-raum.jpg"
        imageAlt="Gastraum bei Wassana Thai Imbiss in Landshut"
      >
        <ContentBlock title="Was Wassana bedeutet">
          <p className="text-[color:var(--ink)]">{content.meaning}</p>
        </ContentBlock>

        <ContentBlock title="Thai Imbiss am Regierungsplatz">
          <p>
            {business.fullName} ist euer Thai Imbiss in Landshut — zentral am{" "}
            {business.street}. Bei uns gibt es Curries, Wok-Gerichte und Klassiker
            der thailändischen Küche, frisch zubereitet und gerne zum Mitnehmen.
          </p>
          <p>
            Inhaber:{" "}
            <strong className="text-[color:var(--ink)]">{business.owner}</strong>
          </p>
        </ContentBlock>

        <ContentBlock title="Wann wir für euch da sind">
          <p>
            {content.hours.weekdaysLong}. {content.hours.weekend}.
          </p>
          <p>
            Ideal für die Mittagspause, zum Abholen nach der Arbeit oder für ein
            authentisches Thai-Gericht zwischendurch.
          </p>
        </ContentBlock>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/speisekarte" className="btn-primary">
            Speisekarte
          </Link>
          <Link href="/kontakt" className="btn-gold">
            Kontakt
          </Link>
        </div>
      </ContentPage>

      <ImageStrip
        items={[
          {
            src: "/images/laden-eingang-heute.jpg",
            alt: "Eingang von Wassana Thai Imbiss in Landshut",
            label: "Eingang",
            href: "/anfahrt",
          },
          {
            src: "/images/laden-tafeln.jpg",
            alt: "Tagesgerichte auf den Tafeln vor Wassana",
            label: "Heute bei Wassana",
            href: "/speisekarte",
          },
          {
            src: "/images/atmosphaere-buddha.jpg",
            alt: "Buddha-Figur bei Wassana Thai Imbiss",
            label: "Atmosphäre",
            href: "/ueber-uns",
          },
        ]}
      />
    </>
  );
}
