import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { MediaBand, SplitMedia } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thai Catering Landshut",
  description:
    "Thai Catering in Landshut von Wassana: individueller Menüplan inkl. Geschirr für Geburtstage, Firmenfeiern und Hochzeiten.",
  alternates: { canonical: "/catering" },
  openGraph: {
    title: "Thai Catering Landshut | Wassana",
    description: "Catering-Service mit Thai-Atmosphäre für Ihr Event.",
    url: "/catering",
  },
};

export default function CateringPage() {
  return (
    <main>
      <MediaBand
        src="/images/soup.jpg"
        alt="Thai-Gerichte fürs Catering von Wassana"
        eyebrow="Catering Landshut"
        title="Feierlichkeiten mit Thai-Atmosphäre"
        text="Geburtstage, Firmenfeiern oder Hochzeiten — individueller Menüplan und passendes Geschirr."
        priority
        height="short"
      />

      <SplitMedia
        src="/images/hero.jpg"
        alt="Angerichtetes Thai-Gericht für Events"
        imageRight={false}
      >
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Unser Service
          </p>
          <h2 className="font-display mt-4 text-3xl text-[color:var(--red)]">
            Was wir übernehmen
          </h2>
          <ul className="mt-6 space-y-3 text-[color:var(--muted)]">
            {[
              "Individueller Menüplan",
              "Passendes Geschirr",
              "Geburtstage, Firmenfeiern & Hochzeiten",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gold)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.cateringEmailHref} className="btn-primary">
              Per E-Mail anfragen
            </a>
            <a href={site.phoneHref} className="btn-gold">
              Anrufen
            </a>
          </div>
        </Reveal>
      </SplitMedia>

      <section className="bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              Anfrage
            </p>
            <h2 className="font-display mt-3 text-3xl text-[color:var(--ink)]">
              Wir planen mit Ihnen
            </h2>
            <p className="mt-4 leading-relaxed text-[color:var(--muted)]">
              Kurz Anlass, Personenzahl und Wunschtermin reichen — wir melden
              uns mit einem Vorschlag. Auch über das{" "}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                Kontaktformular
              </Link>{" "}
              möglich.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <ContactForm
              to={site.email}
              subject="Catering Anfrage Landshut"
              title="Catering anfragen"
              intro="Kurz Anlass, Personenzahl und Wunschtermin — wir melden uns."
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
