import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Catering von Wassana Thai Imbiss für Events und Feierlichkeiten in Landshut — Menü nach Wunsch inkl. Geschirr.",
};

export default function CateringPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Catering
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-[color:var(--red)] md:text-6xl">
            Für Events und Feierlichkeiten
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">
            Für Events und Feierlichkeiten bieten wir Ihnen einen
            Catering-Service an. Wir erstellen nach Ihren Wünschen ein Menü
            zusammen und stellen das Geschirr zur Verfügung.
          </p>
          <a href={site.cateringEmailHref} className="btn-primary mt-8">
            Per E-Mail anfragen
          </a>
        </Reveal>
      </section>

      <section className="bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/curry.jpg"
                alt="Thai-Gerichte für Ihr Event"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="font-display text-3xl text-[color:var(--ink)] md:text-4xl">
              Menü nach Wunsch — authentisch und frisch
            </h2>
            <ul className="mt-8 space-y-4 text-[color:var(--muted)]">
              {[
                "Individuelle Menüplanung mit Curries, Wok und Beilagen",
                "Geschirr und Service auf Anfrage",
                "Für Firmenfeiern, Geburtstage und private Events",
                "Persönliche Beratung per E-Mail oder Telefon",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gold)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={site.cateringEmailHref} className="btn-primary">
                E-Mail an {site.email}
              </a>
              <a href={site.phoneHref} className="btn-gold">
                {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
