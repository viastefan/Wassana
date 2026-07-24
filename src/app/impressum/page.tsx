import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum von ${site.fullName}, ${site.address.street}, ${site.address.zip} ${site.address.city}.`,
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Rechtliches
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Impressum
          </h1>
        </Reveal>

        <Reveal>
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="font-display text-2xl">{site.fullName}</h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Inh.: {site.owner}
                <br />
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
              </p>
            </div>

            <div className="gold-rule" />

            <div>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Kontakt
              </h2>
              <p className="mt-3">
                Tel.:{" "}
                <a href={site.phoneHref} className="hover:text-[color:var(--red)]">
                  {site.phone}
                </a>
                <br />
                E-Mail:{" "}
                <a href={site.emailHref} className="hover:text-[color:var(--red)]">
                  {site.email}
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Öffnungszeiten
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                {site.hours.weekdaysLong}
                <br />
                {site.hours.weekend}
              </p>
            </div>

            <div>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Social Media
              </h2>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block hover:text-[color:var(--red)]"
              >
                Facebook
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
