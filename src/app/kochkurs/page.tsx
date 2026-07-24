import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kochkurs",
  description:
    "Thailändischer Kochkurs bei Wassana — in drei Stunden beliebte Gerichte wie Pad Thai oder Tom Yam gemeinsam zubereiten.",
};

export default function KochkursPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Kochkurs
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-[color:var(--red)] md:text-6xl">
            Die thailändische Küche näher kennenlernen
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">
            Haben Sie Interesse, die thailändische Küche näher
            kennenzulernen? Dafür bieten wir an bestimmten Tagen einen Kochkurs
            an. In dem 3-stündigen Kurs bereiten wir zusammen mit Ihnen
            beliebte Gerichte wie Pad Thai oder Tom Yam zu.
          </p>
          <a href={site.cookingEmailHref} className="btn-primary mt-8">
            Per E-Mail anfragen
          </a>
        </Reveal>
      </section>

      <section className="bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <Reveal>
            <h2 className="font-display text-3xl text-[color:var(--ink)] md:text-4xl">
              Drei Stunden. Frische Gewürze. Gemeinsam genießen.
            </h2>
            <div className="mt-8 space-y-6">
              {[
                {
                  title: "Dauer",
                  text: "Ca. 3 Stunden — praxisnah und in kleiner Runde.",
                },
                {
                  title: "Gerichte",
                  text: "Beliebte Klassiker wie Pad Thai oder Tom Yam.",
                },
                {
                  title: "Termine",
                  text: "An ausgewählten Tagen — einfach per E-Mail nachfragen.",
                },
              ].map((item) => (
                <div key={item.title} className="border-t border-[color:var(--line)] pt-5">
                  <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[color:var(--muted)]">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={site.cookingEmailHref} className="btn-primary">
                E-Mail an {site.cookingEmail}
              </a>
              <a href={site.phoneHref} className="btn-gold">
                {site.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/ingredients.jpg"
                alt="Zutaten für den Thai-Kochkurs"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
