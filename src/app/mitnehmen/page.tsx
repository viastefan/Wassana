import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thai Essen mitnehmen Landshut",
  description:
    "Thai Essen in Landshut mitnehmen: frisch gekocht am Regierungsplatz, Mo–Fr Abholen. Curries, Wok und beliebte Gerichte der Woche zum Mitnehmen.",
  alternates: { canonical: "/mitnehmen" },
  openGraph: {
    title: "Thai Essen mitnehmen | Wassana Landshut",
    description:
      "Frisch abholen am Regierungsplatz — Curries, Wok und mehr zum Mitnehmen.",
    url: "/mitnehmen",
  },
  robots: { index: true, follow: true },
};

export default async function MitnehmenPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  return (
    <ContentPage
      breadcrumbs={[
        { name: "Start", path: "/" },
        { name: "Mitnehmen", path: "/mitnehmen" },
      ]}
      eyebrow="Abholen in Landshut"
      title="Frisch mitnehmen"
      lead="Curries, Wok und Klassiker — frisch aus der Küche, ideal für Büro, Pause oder zu Hause."
      image="/images/soup.jpg"
      imageAlt="Tom Yum und Thai-Gerichte zum Mitnehmen bei Wassana in Landshut"
    >
      <ContentBlock title="So funktioniert Abholen">
        <p>
          Ihr bestellt telefonisch unter{" "}
          <a href={business.phoneHref} className="text-[color:var(--red)]">
            {business.phone}
          </a>{" "}
          oder kommt vorbei. Wir kochen frisch und packen euer Essen zum
          Mitnehmen ein.
        </p>
        <p>
          Adresse: {business.street}, {business.zip} {business.city} — zentral
          am Regierungsplatz.
        </p>
      </ContentBlock>

      <ContentBlock title="Wann abholen?">
        <p>
          {content.hours.weekdaysLong}. {content.hours.weekend}.
        </p>
        <p>
          Besonders zur Mittagszeit lohnt sich ein Blick auf die aktuellen
          beliebten Gerichte der Woche — viele eignen sich gut zum Mitnehmen.
        </p>
      </ContentBlock>

      <ContentBlock title="Was eignet sich zum Mitnehmen?">
        <p>
          Curries mit Duftreis, Wok-Gerichte, Suppen und die beliebten Gerichte
          der Woche lassen sich gut transportieren. Schärfe könnt ihr nach
          Wunsch wählen.
        </p>
      </ContentBlock>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/speisekarte" className="btn-primary">
          Speisekarte ansehen
        </Link>
        <a href={business.phoneHref} className="btn-gold">
          {business.phone}
        </a>
        <Link href="/anfahrt" className="btn-gold">
          Anfahrt
        </Link>
      </div>
    </ContentPage>
  );
}
