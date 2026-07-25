import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: `Datenschutzerklärung von ${site.fullName} in ${site.address.city}.`,
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Rechtliches
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Datenschutz
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO
          </p>
        </Reveal>

        <div className="mt-12 space-y-10 leading-relaxed text-[color:var(--muted)]">
          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                1. Verantwortlicher
              </h2>
              <p className="mt-3 text-[color:var(--ink)]">
                {site.fullName}
                <br />
                Inhaber: {site.owner}
                <br />
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
              </p>
              <p className="mt-3">
                Telefon:{" "}
                <a href={site.phoneHref} className="text-[color:var(--red)]">
                  {site.phone}
                </a>
                <br />
                E-Mail:{" "}
                <a href={site.emailHref} className="text-[color:var(--red)]">
                  {site.email}
                </a>
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                2. Allgemeines zur Datenverarbeitung
              </h2>
              <p className="mt-3">
                Wir verarbeiten personenbezogene Daten nur, soweit dies zur
                Bereitstellung einer funktionsfähigen Website sowie unserer
                Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt
                auf Grundlage der DSGVO und des BDSG.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                3. Hosting
              </h2>
              <p className="mt-3">
                Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133,
                Covina, CA 91723, USA („Vercel“) gehostet. Dabei können
                Server-Logfiles (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite,
                Browser-Informationen) verarbeitet werden, soweit dies für den
                Betrieb und die Sicherheit der Website erforderlich ist
                (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="mt-3">
                Weitere Informationen:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Vercel Privacy Policy
                </a>
                .
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                4. Kontaktaufnahme
              </h2>
              <p className="mt-3">
                Bei Kontakt per Telefon, E-Mail oder über das Kontaktformular
                werden die von Ihnen mitgeteilten Daten (z. B. Name, E-Mail,
                Nachricht, Telefonnummer) zur Bearbeitung Ihrer Anfrage
                verarbeitet (Art. 6 Abs. 1 lit. b DSGVO bzw. lit. f DSGVO).
              </p>
              <p className="mt-3">
                Über das Kontaktformular werden Ihre Angaben an unseren Server
                übermittelt, dort zur Bearbeitung gespeichert und per E-Mail an
                uns sowie als Bestätigung an Ihre angegebene Adresse versendet.
                Die Speicherung erfolgt nur so lange, wie es für die Bearbeitung
                der Anfrage erforderlich ist.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                5. Google Maps
              </h2>
              <p className="mt-3">
                Auf unserer Website ist eine Karte von Google Maps eingebunden
                (Anbieter: Google Ireland Limited, Gordon House, Barrow Street,
                Dublin 4, Irland). Beim Laden der Karte kann Google Daten
                erheben (u. a. IP-Adresse). Die Einbindung erfolgt zur
                Darstellung unseres Standorts (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="mt-3">
                Weitere Informationen:{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Google Datenschutzerklärung
                </a>
                .
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                6. Cookies / lokale Speicherung
              </h2>
              <p className="mt-3">
                Wir setzen keine Tracking- oder Marketing-Cookies ein. Technisch
                notwendige Speicherung im Browser kann vorkommen, z. B. wenn Sie
                den Hinweis zum Kochkurs schließen (sessionStorage) oder sich im
                Admin-Bereich anmelden (Session-Cookie). Diese Speicherung dient
                ausschließlich der Funktion der Website (Art. 6 Abs. 1 lit. f
                DSGVO).
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                7. Social Media
              </h2>
              <p className="mt-3">
                Auf unserer Website verlinken wir auf Profile bei Instagram und
                Facebook. Beim Anklicken der Links verlassen Sie unsere Website.
                Für die Datenverarbeitung auf den Plattformen der jeweiligen
                Anbieter gelten deren Datenschutzbestimmungen.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                8. Speicherdauer
              </h2>
              <p className="mt-3">
                Wir speichern personenbezogene Daten nur so lange, wie es für
                den jeweiligen Zweck erforderlich ist oder gesetzliche
                Aufbewahrungsfristen bestehen. Anfragen per E-Mail werden in der
                Regel nur so lange aufbewahrt, wie die Korrespondenz das
                erfordert.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                9. Ihre Rechte
              </h2>
              <p className="mt-3">
                Sie haben im Rahmen der gesetzlichen Vorschriften insbesondere
                Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der
                Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die
                Verarbeitung. Außerdem besteht ein Beschwerderecht bei einer
                Datenschutzaufsichtsbehörde.
              </p>
              <p className="mt-3">
                Zuständige Aufsichtsbehörde u. a.: Bayerisches Landesamt für
                Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                10. Aktualität
              </h2>
              <p className="mt-3">
                Diese Datenschutzerklärung hat den Stand {new Date().getFullYear()}.
                Wir behalten uns vor, sie anzupassen, wenn sich unsere Website
                oder Rechtslage ändert.
              </p>
              <p className="mt-3 text-sm">
                Siehe auch das{" "}
                <Link
                  href="/impressum"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Impressum
                </Link>
                .
              </p>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
