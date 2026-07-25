import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
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
    <main className="pt-24">
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Catering Landshut
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-[color:var(--red)] md:text-5xl">
            Für Feierlichkeiten mit Thai-Atmosphäre
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">
            Für Geburtstage, Firmenfeiern oder Hochzeiten bieten wir unseren
            Catering-Service an. Zusammen mit Ihnen erstellen wir einen
            individuellen Menüplan und stellen das passende Geschirr zur
            Verfügung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.cateringEmailHref} className="btn-primary">
              Per E-Mail anfragen
            </a>
            <a href={site.phoneHref} className="btn-gold">
              Anrufen
            </a>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-[color:var(--line)] bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <Reveal>
            <h2 className="font-display text-3xl text-[color:var(--ink)]">
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
            <p className="mt-8 text-sm text-[color:var(--muted)]">
              Oder nutze unser{" "}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                Kontaktformular
              </Link>
              .
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
