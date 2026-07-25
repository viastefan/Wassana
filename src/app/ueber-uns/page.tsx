import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { getResolvedBusiness } from "@/lib/business-profile";
import { pageMetadata } from "@/lib/seo-metadata";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Über uns",
  description:
    "Über Wassana in Landshut: Bedeutung von Glück und gutem Schicksal, frische Thai-Küche am Regierungsplatz und unser Imbiss zum Mitnehmen.",
  path: "/ueber-uns",
  keywords: ["Wassana Thai Imbiss", "Wassana Landshut", "Thai Imbiss Regierungsplatz"],
  image: {
    url: "/images/ingredients.jpg",
    width: 1600,
    height: 1067,
    alt: "Frische Zutaten der Thai-Küche bei Wassana in Landshut",
  },
});

export default async function UeberUnsPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  return (
    <ContentPage
      breadcrumbs={[
        { name: "Start", path: "/" },
        { name: "Über uns", path: "/ueber-uns" },
      ]}
      eyebrow="Wassana Landshut"
      title="Über uns"
      lead="Frisch gekocht am Regierungsplatz — mit dem Wunsch nach Glück und gutem Schicksal."
      image="/images/ingredients.jpg"
      imageAlt="Frische Zutaten der Thai-Küche bei Wassana in Landshut"
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
  );
}
