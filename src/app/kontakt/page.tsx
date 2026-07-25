import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLdBreadcrumbs, JsonLdWebPage } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getSiteContent } from "@/lib/site-content";
import { getResolvedBusiness } from "@/lib/business-profile";
import { pageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt Thai Imbiss Landshut",
  description:
    "Kontakt zu Wassana Thai Imbiss in Landshut: Telefon, E-Mail, Adresse Regierungsplatz 542 und Öffnungszeiten Mo–Fr 11–18 Uhr.",
  path: "/kontakt",
  keywords: [
    "Kontakt Thai Landshut",
    "Wassana Telefon",
    "Thai Imbiss Landshut Kontakt",
  ],
});

const crumbs = [
  { name: "Start", path: "/" },
  { name: "Kontakt", path: "/kontakt" },
];

export default async function KontaktPage() {
  const [content, business] = await Promise.all([
    getSiteContent(),
    getResolvedBusiness(),
  ]);
  const mapsUrl = business.maps.place;

  return (
    <main className="pt-24">
      <JsonLdBreadcrumbs items={crumbs} />
      <JsonLdWebPage
        name="Kontakt Thai Imbiss Landshut"
        description="Kontakt, Telefon und Adresse von Wassana Thai Imbiss in Landshut."
        path="/kontakt"
      />
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-[var(--section-y)] md:grid-cols-2 md:gap-20 md:px-8">
        <Reveal>
          <Breadcrumbs items={crumbs} />
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Kontakt Landshut
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Kontakt Thai Imbiss Landshut
          </h1>
          <p className="mt-5 max-w-md text-lg text-[color:var(--muted)]">
            Für Bestellungen, Catering oder den Kochkurs sind wir gerne für dich
            da — mitten in Landshut.
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-sm text-[color:var(--gold)]">Telefon</p>
              <a
                href={business.phoneHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {business.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">E-Mail</p>
              <a
                href={business.emailHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {business.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">Adresse</p>
              <p className="mt-1 text-xl">
                {business.street}
                <br />
                {business.zip} {business.city}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                In Google Maps öffnen
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">Öffnungszeiten</p>
              <p className="mt-1 text-[color:var(--ink)]">
                {content.hours.weekdaysLong}
                <br />
                <span className="text-[color:var(--muted)]">
                  {content.hours.weekend}
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <ContactForm source="kontakt" />
        </Reveal>
      </section>
    </main>
  );
}
