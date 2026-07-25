import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

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
};

const mapsUrl = site.maps.place;

export default function KontaktPage() {
  return (
    <main>
      <MediaBand
        src="/images/hero.jpg"
        alt="Wassana Thai Imbiss in Landshut"
        eyebrow="Kontakt Landshut"
        title="Schreib uns oder ruf an"
        text="Für Bestellungen, Catering oder den Kochkurs — mitten in Landshut."
        priority
        height="short"
      />

      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
        <Reveal>
          <div className="relative mb-10 aspect-[4/3] overflow-hidden">
            <Image
              src="/images/curry.jpg"
              alt="Gerichte von Wassana"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[color:var(--gold)]">Telefon</p>
              <a
                href={site.phoneHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {site.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">E-Mail</p>
              <a
                href={site.emailHref}
                className="mt-1 block text-xl hover:text-[color:var(--red)]"
              >
                {site.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-[color:var(--gold)]">Adresse</p>
              <p className="mt-1 text-xl">
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
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
                {site.hours.weekdaysLong}
                <br />
                <span className="text-[color:var(--muted)]">
                  {site.hours.weekend}
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <ContactForm />
        </Reveal>
      </section>
    </main>
  );
}
