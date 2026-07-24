import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt zu Wassana Thai Imbiss in Landshut — Telefon, E-Mail und Nachricht.",
};

export default function KontaktPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-12 md:grid-cols-2 md:gap-20 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Kontakt
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Schreib uns oder ruf an
          </h1>
          <p className="mt-5 max-w-md text-lg text-[color:var(--muted)]">
            Für Bestellungen, Catering oder den Kochkurs sind wir gerne für dich
            da.
          </p>

          <div className="mt-10 space-y-6">
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
