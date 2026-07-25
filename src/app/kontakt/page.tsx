import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getSiteContent } from "@/lib/site-content";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSitePages } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontakt Thai Imbiss Landshut",
  description:
    "Kontakt zu Wassana Thai Imbiss in Landshut: Telefon, E-Mail, Adresse Regierungsplatz 542 und Öffnungszeiten Mo–Fr 11–18 Uhr.",
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: "Kontakt | Wassana Thai Imbiss Landshut",
    description: "So erreichst du uns in Landshut am Regierungsplatz.",
    url: "/kontakt",
  },
  robots: { index: true, follow: true },
};

export default async function KontaktPage() {
  const [content, business, pages] = await Promise.all([
    getSiteContent(),
    getResolvedBusiness(),
    getSitePages(),
  ]);
  const copy = pages.kontakt;
  const mapsUrl = business.maps.place;

  return (
    <main className="pt-24">
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
        ]}
      />
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-[var(--section-y)] md:grid-cols-2 md:gap-20 md:px-8">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-md text-lg text-[color:var(--muted)]">
            {copy.lead}
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-sm text-[color:var(--gold)]">{copy.labelPhone}</p>
              <a
                href={business.phoneHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {business.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">{copy.labelEmail}</p>
              <a
                href={business.emailHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {business.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">
                {copy.labelAddress}
              </p>
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
                {copy.mapsLink}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">{copy.labelHours}</p>
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
          <ContactForm
            source="kontakt"
            title={copy.formTitle}
            intro={copy.formIntro}
            subject={copy.formSubject}
          />
        </Reveal>
      </section>
    </main>
  );
}
