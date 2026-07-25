import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum von ${site.fullName}, ${site.address.street}, ${site.address.zip} ${site.address.city}.`,
  alternates: { canonical: "/impressum" },
  openGraph: {
    title: "Impressum | Wassana Thai Imbiss Landshut",
    description: `Rechtliche Angaben zu ${site.fullName} in Landshut.`,
    url: "/impressum",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ImpressumPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);
  return (
    <main className="pt-24">
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "Impressum", path: "/impressum" },
        ]}
      />
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Rechtliches
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Impressum
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Angaben gemäß § 5 DDG (früher TMG)
          </p>
        </Reveal>

        <div className="mt-12 space-y-10 text-[color:var(--ink)] leading-relaxed">
          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Anbieter
              </h2>
              <p className="mt-3">
                <strong>{business.fullName}</strong>
                <br />
                Inhaber: {business.owner}
                <br />
                {business.street}
                <br />
                {business.zip} {business.city}
                <br />
                Deutschland
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Kontakt
              </h2>
              <p className="mt-3">
                Telefon:{" "}
                <a href={business.phoneHref} className="hover:text-[color:var(--red)]">
                  {business.phone}
                </a>
                <br />
                E-Mail:{" "}
                <a href={business.emailHref} className="hover:text-[color:var(--red)]">
                  {business.email}
                </a>
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Umsatzsteuer
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                {business.taxNote}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Verantwortlich für den Inhalt
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
                <br />
                <span className="text-[color:var(--ink)]">{business.owner}</span>
                <br />
                {business.street}, {business.zip} {business.city}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Öffnungszeiten
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                {content.hours.weekdaysLong}
                <br />
                {content.hours.weekend}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Online-Streitbeilegung
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Wir sind nicht verpflichtet und nicht bereit, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Haftung für Inhalte
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
                Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
                hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst
                ab dem Zeitpunkt der Kenntnis einer konkreten
                Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Haftung für Links
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Unser Angebot enthält Links zu externen Websites Dritter, auf
                deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
                wurden zum Zeitpunkt der Verlinkung auf mögliche
                Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
                Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente
                inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
                konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
                Bei Bekanntwerden von Rechtsverletzungen werden wir derartige
                Links umgehend entfernen.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Urheberrecht / Bilder
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten — einschließlich Texte, Gestaltung, Logo sowie
                Fotos und Grafiken — unterliegen dem deutschen Urheberrecht bzw.
                den Nutzungsrechten der jeweiligen Rechteinhaber. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten,
                nicht kommerziellen Gebrauch gestattet.
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Soweit auf Bildern Personen erkennbar abgebildet sind, erfolgt
                die Nutzung nur im gesetzlich zulässigen Rahmen. Hinweise dazu
                finden Sie in der{" "}
                <Link
                  href="/datenschutz"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Social Media
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[color:var(--red)]"
                >
                  Instagram {business.instagramHandle}
                </a>
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[color:var(--red)]"
                >
                  Facebook
                </a>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <p className="text-sm text-[color:var(--muted)]">
              Siehe auch unsere{" "}
              <Link
                href="/datenschutz"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
