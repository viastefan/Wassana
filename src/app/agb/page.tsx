import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AGB",
  description: `Allgemeine Geschäftsbedingungen von ${site.fullName} für Speisen zum Mitnehmen, Catering und Kochkurs in Landshut.`,
  alternates: { canonical: "/agb" },
  openGraph: {
    title: "AGB | Wassana Thai Imbiss Landshut",
    description:
      "Vertragsbedingungen für Speisenverkauf, Mitnehmen, Catering und Kochkurs.",
    url: "/agb",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function AgbPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);

  const updated = new Date().toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="pt-24">
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "AGB", path: "/agb" },
        ]}
      />
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Rechtliches
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            AGB
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Allgemeine Geschäftsbedingungen für den Verkauf von Speisen und
            Getränken sowie für Catering und Kochkurs bei {business.fullName}.
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Stand: {updated}
          </p>
        </Reveal>

        <div className="mt-12 space-y-10 text-[color:var(--ink)] leading-relaxed">
          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                1. Geltungsbereich
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
                Verträge zwischen
              </p>
              <p className="mt-3">
                <strong>{business.fullName}</strong>
                <br />
                Inhaber: {business.owner}
                <br />
                {business.street}
                <br />
                {business.zip} {business.city}
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                (nachfolgend „Anbieter“) und Kunden über den Verkauf von Speisen
                und Getränken zum Verzehr vor Ort bzw. zum Mitnehmen, über
                Catering-Leistungen sowie über die Teilnahme an Kochkursen.
                Abweichende Bedingungen des Kunden gelten nur, wenn der Anbieter
                ihnen ausdrücklich schriftlich zustimmt.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                2. Angebot und Vertragsschluss
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Die Darstellung von Speisen, Preisen und Angeboten auf der
                Website und in der Speisekarte ist freibleibend und stellt noch
                kein verbindliches Angebot dar. Ein Vertrag kommt zustande,
                wenn der Anbieter die Bestellung des Kunden annimmt — in der
                Regel durch ausdrückliche Bestätigung, Annahme der Bestellung
                vor Ort oder durch Zubereitung und Ausgabe der Speisen.
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Online-Kontaktformulare (z.&nbsp;B. für Catering oder Kochkurs)
                sind unverbindliche Anfragen. Ein verbindlicher Vertrag kommt
                erst durch gesonderte Bestätigung des Anbieters zustande.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                3. Preise und Zahlung
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Es gelten die zum Zeitpunkt der Bestellung ausgewiesenen Preise
                in Euro. Preise verstehen sich inklusive der gesetzlichen
                Umsatzsteuer, soweit nicht anders angegeben.{" "}
                {business.taxNote}
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Die Zahlung erfolgt grundsätzlich vor Ort bei Abholung bzw.
                Ausgabe, sofern nichts anderes vereinbart wurde. Für Catering
                und Kochkurse können Anzahlungen oder Vorkasse vereinbart
                werden. Akzeptierte Zahlungsmittel teilt der Anbieter vor Ort
                bzw. in der Auftragsbestätigung mit.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                4. Abholung und Öffnungszeiten
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Speisen zum Mitnehmen sind während der Öffnungszeiten am
                Standort {business.street}, {business.zip} {business.city}
                erhältlich. Aktuelle Öffnungszeiten:{" "}
                {content.hours.weekdaysLong}. {content.hours.weekend}
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Lieferungen an Endkunden sind nicht Teil des Standardangebots,
                sofern nicht ausdrücklich anders vereinbart (z.&nbsp;B.
                Catering). Der Kunde ist verpflichtet, bestellte Ware
                rechtzeitig abzuholen. Bei nicht abgeholten Bestellungen
                behält sich der Anbieter vor, den Kaufpreis zu berechnen, wenn
                die Speisen bereits zubereitet wurden.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                5. Allergene, Inhaltsstoffe und Qualität
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Informationen zu Allergenen und Zusatzstoffen finden sich in
                der Speisekarte und unter{" "}
                <Link
                  href="/speisekarte#kennzeichnung"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Kennzeichnung
                </Link>
                . Bei Unverträglichkeiten oder Allergien ist der Kunde
                verpflichtet, vor der Bestellung nachzufragen. Spuren von
                Allergenen können trotz Sorgfalt nicht vollständig
                ausgeschlossen werden.
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Speisen sind zum alsbaldigen Verzehr bestimmt. Der Anbieter
                übernimmt keine Gewähr für Qualität oder Haltbarkeit, wenn
                Speisen unsachgemäß gelagert, transportiert oder erst
                verspätet verzehrt werden.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                6. Catering
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Catering-Leistungen bedürfen einer individuellen Absprache
                (Umfang, Termin, Ort, Personenanzahl, Preis). Bis zur
                schriftlichen oder ausdrücklich bestätigten Annahme bleibt das
                Angebot unverbindlich. Stornierungen und Änderungen richten
                sich nach der jeweiligen Auftragsbestätigung; fehlt eine
                Regelung, gilt: Absagen kurz vor dem Termin können anteilige
                oder vollständige Kosten verursachen, wenn bereits Ware
                beschafft oder vorbereitet wurde.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                7. Kochkurs
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Die Teilnahme an Kochkursen setzt eine Anmeldung und die
                Bestätigung durch den Anbieter voraus. Kurspreis, Termin,
                Dauer und Leistungen ergeben sich aus der Kursbeschreibung
                bzw. Bestätigung. Bei Absage durch den Kunden kann — je nach
                Vorlauf — die Kursgebühr ganz oder teilweise einbehalten
                werden, sofern in der Bestätigung nichts Abweichendes steht.
                Der Anbieter kann Termine aus wichtigem Grund verschieben;
                bereits gezahlte Beträge werden dann gutgeschrieben oder
                erstattet.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                8. Widerrufsrecht
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Für Speisen und Getränke, die wegen ihrer Beschaffenheit nicht
                für eine Rücksendung geeignet sind bzw. schnell verderben
                können, sowie für Waren, die nach Kundenspezifikation
                angefertigt oder eindeutig auf die persönlichen Bedürfnisse
                zugeschnitten sind, besteht kein Widerrufsrecht (§&nbsp;312g
                Abs.&nbsp;2 BGB). Das gilt insbesondere für frisch zubereitete
                Speisen zum Mitnehmen.
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Für sonstige entgeltliche Leistungen (z.&nbsp;B. bestimmte
                Fernabsatzverträge) gelten die gesetzlichen Regelungen. Soweit
                ein Widerrufsrecht besteht, wird der Kunde darüber gesondert
                informiert.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                9. Haftung
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Der Anbieter haftet unbeschränkt bei Vorsatz und grober
                Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder
                Gesundheit. Bei leicht fahrlässiger Verletzung wesentlicher
                Vertragspflichten ist die Haftung auf den vorhersehbaren,
                vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung
                für leichte Fahrlässigkeit ausgeschlossen. Die Haftung nach dem
                Produkthaftungsgesetz bleibt unberührt.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                10. Datenschutz
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Informationen zur Verarbeitung personenbezogener Daten finden
                Sie in der{" "}
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
                11. Schlussbestimmungen
              </h2>
              <p className="mt-3 text-[color:var(--muted)]">
                Es gilt das Recht der Bundesrepublik Deutschland unter
                Ausschluss des UN-Kaufrechts. Ist der Kunde Verbraucher, bleiben
                zwingende Schutzvorschriften des Staates unberührt, in dem er
                seinen gewöhnlichen Aufenthalt hat. Sollten einzelne
                Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen
                Bestimmungen unberührt.
              </p>
              <p className="mt-3 text-[color:var(--muted)]">
                Anbieterkennzeichnung und weitere Pflichtangaben:{" "}
                <Link
                  href="/impressum"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Impressum
                </Link>
                .
              </p>
              <p className="mt-5 text-sm text-[color:var(--muted)]">
                Kontakt:{" "}
                <a
                  href={business.phoneHref}
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  {business.phone}
                </a>
                {" · "}
                <a
                  href={business.emailHref}
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  {business.email}
                </a>
              </p>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
