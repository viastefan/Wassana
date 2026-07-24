import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thai Kochkurs Landshut",
  description:
    "Thai Kochkurs in Landshut bei Wassana: In 3 Stunden Pad Thai, Tom Yam und mehr gemeinsam kochen. Termine auf Anfrage.",
  alternates: { canonical: "/kochkurs" },
  openGraph: {
    title: "Thai Kochkurs Landshut | Wassana",
    description: "3-stündiger Kochkurs mit klassischen Thai-Gerichten.",
    url: "/kochkurs",
  },
};

export default function KochkursPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Kochkurs Landshut
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-[color:var(--red)] md:text-5xl">
            Thai kochen lernen in Landshut
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">
            An ausgewählten Tagen: In drei Stunden bereiten wir gemeinsam
            beliebte Gerichte wie Pad Thai oder Tom Yam zu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.cookingEmailHref} className="btn-primary">
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
            <div className="space-y-6">
              {[
                { label: "Dauer", value: "ca. 3 Stunden" },
                { label: "Gerichte", value: "z. B. Pad Thai oder Tom Yam" },
                {
                  label: "Termine",
                  value: "an bestimmten Tagen — einfach anfragen",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-t border-[color:var(--line)] pt-5"
                >
                  <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg text-[color:var(--ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[color:var(--muted)]">
              Auch über das{" "}
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
              to={site.cookingEmail}
              subject="Kochkurs Anfrage Landshut"
              title="Kursplatz anfragen"
              intro="Name, Personenanzahl und Wunschtermin reichen völlig."
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
