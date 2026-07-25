import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Datenschutzerklärung von ${site.fullName} in ${site.address.city} — Informationen zu Cookies, Google Maps, Kontaktformular, Hosting und Bildern gemäß DSGVO und TTDSG.`,
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

const lastUpdated = "25. Juli 2026";

export default async function DatenschutzPage() {
  const business = await getResolvedBusiness();
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Rechtliches
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Datenschutzerklärung
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Informationen zur Verarbeitung personenbezogener Daten nach der
            DSGVO, dem BDSG und dem TTDSG. Stand: {lastUpdated}.
          </p>
        </Reveal>

        <div className="mt-12 space-y-10 leading-relaxed text-[color:var(--muted)]">
          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                1. Verantwortlicher
              </h2>
              <p className="mt-3 text-[color:var(--ink)]">
                {business.fullName}
                <br />
                Inhaber: {business.owner}
                <br />
                {business.street}
                <br />
                {business.zip} {business.city}
                <br />
                Deutschland
              </p>
              <p className="mt-3">
                Telefon:{" "}
                <a href={business.phoneHref} className="text-[color:var(--red)]">
                  {business.phone}
                </a>
                <br />
                E-Mail:{" "}
                <a href={business.emailHref} className="text-[color:var(--red)]">
                  {business.email}
                </a>
              </p>
              <p className="mt-3">
                Der Verantwortliche entscheidet allein über die Zwecke und Mittel
                der Verarbeitung personenbezogener Daten auf dieser Website.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                2. Überblick / Begriffe
              </h2>
              <p className="mt-3">
                Personenbezogene Daten sind alle Informationen, die sich auf eine
                identifizierte oder identifizierbare natürliche Person beziehen
                (z. B. Name, E-Mail-Adresse, IP-Adresse). Verarbeitung meint
                jeden Umgang mit diesen Daten (Erheben, Speichern, Nutzen,
                Übermitteln, Löschen usw.).
              </p>
              <p className="mt-3">
                Wir verarbeiten Daten nur, soweit dies für den Betrieb der
                Website, die Beantwortung von Anfragen oder gesetzliche Pflichten
                erforderlich ist — oder wenn Sie eingewilligt haben.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                3. Rechtsgrundlagen
              </h2>
              <p className="mt-3">
                Soweit in den folgenden Abschnitten nicht anders genannt, stützen
                wir Verarbeitungen insbesondere auf:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Art. 6 Abs. 1 lit. a DSGVO — Einwilligung (z. B. Google Maps)
                </li>
                <li>
                  Art. 6 Abs. 1 lit. b DSGVO — Vertrag / vorvertragliche
                  Anfragen (Kontakt, Catering, Kochkurs)
                </li>
                <li>
                  Art. 6 Abs. 1 lit. c DSGVO — rechtliche Verpflichtung
                </li>
                <li>
                  Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse
                  (sicherer Betrieb, Abwehr von Missbrauch)
                </li>
                <li>
                  § 25 Abs. 1 TTDSG — Einwilligung in Speicherung von
                  Informationen auf Ihrem Endgerät, soweit nicht unbedingt
                  erforderlich
                </li>
                <li>
                  § 25 Abs. 2 TTDSG — unbedingt erforderliche Speicherung
                  (z. B. Speichern Ihrer Cookie-/Einwilligungsauswahl)
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                4. Hosting und Server-Logfiles
              </h2>
              <p className="mt-3">
                Diese Website wird bei{" "}
                <strong className="text-[color:var(--ink)]">Vercel Inc.</strong>
                , 440 N Barranca Avenue #4133, Covina, CA 91723, USA („Vercel“)
                gehostet. Vercel verarbeitet in unserem Auftrag technisch
                erforderliche Daten zum Ausliefern der Seiten.
              </p>
              <p className="mt-3">
                Beim Aufruf der Website können u. a. folgende Daten in
                Server-Logfiles verarbeitet werden: IP-Adresse, Datum und Uhrzeit
                der Anfrage, aufgerufene URL, Referrer-URL, Browser- und
                Betriebssysteminformationen, übertragene Datenmenge sowie
                Erfolgs-/Fehlerstatus. Die Verarbeitung dient der
                Bereitstellung, Stabilität und Sicherheit der Website
                (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="mt-3">
                Eine Weitergabe an Vercel kann eine Übermittlung in die USA
                darstellen. Soweit erforderlich, erfolgt dies auf Grundlage
                geeigneter Garantien (z. B. Standardvertragsklauseln) bzw. des
                EU-US Data Privacy Frameworks, soweit anwendbar. Details:{" "}
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
                5. SSL-/TLS-Verschlüsselung
              </h2>
              <p className="mt-3">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
                Übertragung vertraulicher Inhalte eine SSL- bzw.
                TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
                an „https://“ in der Adresszeile Ihres Browsers.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                6. Kontaktformular, E-Mail und Telefon
              </h2>
              <p className="mt-3">
                Wenn Sie uns per Kontaktformular, E-Mail oder Telefon
                kontaktieren, verarbeiten wir die von Ihnen angegebenen Daten
                (z. B. Name, E-Mail-Adresse, Telefonnummer, Nachrichteninhalt,
                Betreff, Zeitpunkt), um Ihre Anfrage zu bearbeiten und ggf. zu
                beantworten.
              </p>
              <p className="mt-3">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die
                Anfrage der Anbahnung oder Durchführung eines Vertrags dient
                (z. B. Catering, Kochkurs, Bestellung), andernfalls Art. 6 Abs. 1
                lit. f DSGVO (berechtigtes Interesse an der Bearbeitung von
                Anfragen).
              </p>
              <p className="mt-3">
                Über das Website-Formular werden Ihre Angaben an unseren Server
                übermittelt, dort zur Bearbeitung gespeichert und — soweit
                E-Mail-Versand konfiguriert ist — per E-Mail an uns sowie als
                Bestätigung an Ihre Adresse gesendet. Technisch kann hierfür ein
                E-Mail-Dienstleister (SMTP-Anbieter) eingesetzt werden, der die
                Nachrichten in unserem Auftrag zustellt.
              </p>
              <p className="mt-3">
                Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht
                mehr erforderlich sind, sofern keine gesetzlichen
                Aufbewahrungspflichten entgegenstehen (z. B. handels- oder
                steuerrechtliche Fristen bei Geschäftsbriefen).
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                7. Cookies, lokale Speicherung und Einwilligung (TTDSG)
              </h2>
              <p className="mt-3">
                Wir setzen <strong className="text-[color:var(--ink)]">keine
                Tracking-, Analyse- oder Marketing-Cookies</strong> ein und laden
                keine Werbenetzwerke.
              </p>
              <p className="mt-3">Auf Ihrem Endgerät können folgende Speichernungen vorkommen:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-[color:var(--ink)]">
                    Einwilligungsstatus
                  </strong>{" "}
                  (localStorage-Schlüssel „wassana-consent-v1“) — speichert, ob
                  Sie notwendige Einstellungen und optional Google Maps
                  akzeptiert haben. Erforderlich zur Dokumentation Ihrer Wahl
                  (§ 25 Abs. 2 TTDSG, Art. 6 Abs. 1 lit. f bzw. lit. c DSGVO).
                </li>
                <li>
                  <strong className="text-[color:var(--ink)]">
                    Kochkurs-Hinweis
                  </strong>{" "}
                  (sessionStorage) — merkt sich in der aktuellen Sitzung, wenn
                  Sie den Hinweis schließen (unbedingt erforderliche /
                  komfortbezogene Speicherung, Art. 6 Abs. 1 lit. f DSGVO).
                </li>
                <li>
                  <strong className="text-[color:var(--ink)]">
                    Admin-Sitzung
                  </strong>{" "}
                  (HTTP-Cookie „wassana_admin“) — nur für den geschützten
                  Verwaltungsbereich des Betreibers, nicht für Website-Besucher
                  (Art. 6 Abs. 1 lit. f DSGVO).
                </li>
              </ul>
              <p className="mt-3">
                Optionale Dienste, die Informationen auf Ihrem Endgerät speichern
                oder auslesen bzw. Drittanbieter laden (hier: Google Maps),
                setzen wir nur nach Ihrer Einwilligung ein (§ 25 Abs. 1 TTDSG,
                Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Entscheidung jederzeit
                über den Link „Cookies“ im Footer neu treffen. Die Einwilligung
                ist widerruflich; der Widerruf gilt für die Zukunft.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                8. Google Maps
              </h2>
              <p className="mt-3">
                Zur Darstellung unseres Standorts kann eine Karte von{" "}
                <strong className="text-[color:var(--ink)]">Google Maps</strong>{" "}
                eingebunden werden. Anbieter ist die Google Ireland Limited,
                Gordon House, Barrow Street, Dublin 4, Irland; Mutterkonzern
                Google LLC, USA.
              </p>
              <p className="mt-3">
                Die Karte wird <strong className="text-[color:var(--ink)]">erst
                nach Ihrer ausdrücklichen Zustimmung</strong> geladen (Cookie-/
                Einwilligungsbanner oder Schaltfläche „Karte laden“). Ohne
                Zustimmung findet keine Verbindung zu Google Maps über die
                eingebettete Karte statt. Alternativ können Sie den Standort über
                einen normalen Link bei Google Maps öffnen.
              </p>
              <p className="mt-3">
                Nach Zustimmung kann Google insbesondere Ihre IP-Adresse sowie
                weitere technische Daten erheben und ggf. in die USA übermitteln.
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG.
                Weitere Informationen:{" "}
                <a
                  href="https://policies.google.com/privacy?hl=de"
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
                9. Schriften (Webfonts)
              </h2>
              <p className="mt-3">
                Für die Darstellung der Website nutzen wir die Schriftart
                „Special Elite“. Die Schrift wird über Next.js beim Build
                eingebunden und von unserem Hosting ausgeliefert. Beim normalen
                Seitenaufruf wird hierfür <strong className="text-[color:var(--ink)]">keine
                Verbindung zu Google Fonts-Servern</strong> hergestellt. Es
                erfolgt insofern keine Übermittlung Ihrer IP-Adresse an Google
                allein wegen der Schriftarten.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                10. Bilder, Fotos und Medien
              </h2>
              <p className="mt-3">
                Auf dieser Website werden Bilder und Grafiken angezeigt
                (z. B. Speisen, Logo, Standortatmosphäre). Die Bilddateien
                werden von unserem eigenen Server / Hosting ausgeliefert und
                enthalten keine Tracking-Pixel Dritter.
              </p>
              <p className="mt-3">
                <strong className="text-[color:var(--ink)]">Urheberrecht:</strong>{" "}
                Die dargestellten Inhalte, Fotos und Grafiken unterliegen dem
                deutschen Urheberrecht bzw. den Nutzungsrechten des jeweiligen
                Rechteinhabers. Eine Nutzung außerhalb der gesetzlich
                erlaubten Fälle bedarf der Zustimmung des Rechteinhabers.
                Einzelheiten finden Sie auch im{" "}
                <Link
                  href="/impressum"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  Impressum
                </Link>
                .
              </p>
              <p className="mt-3">
                <strong className="text-[color:var(--ink)]">
                  Personenbezogene Abbildungen:
                </strong>{" "}
                Soweit auf Fotos erkennbare Personen abgebildet sind, erfolgt die
                Veröffentlichung nur, wenn eine geeignete Rechtsgrundlage
                vorliegt (z. B. Einwilligung der abgebildeten Person, Art. 6
                Abs. 1 lit. a DSGVO, oder ein berechtigtes Interesse nach
                Abwägung gemäß Art. 6 Abs. 1 lit. f DSGVO / KunstUrhG, soweit
                anwendbar). Betroffene Personen können Auskunft verlangen und —
                soweit einschlägig — die Löschung oder Einschränkung der
                Veröffentlichung verlangen.
              </p>
              <p className="mt-3">
                Wenn Sie der Meinung sind, dass ein Bild unberechtigt verwendet
                wird, kontaktieren Sie uns bitte unter{" "}
                <a href={business.emailHref} className="text-[color:var(--red)]">
                  {business.email}
                </a>
                . Wir prüfen den Vorgang unverzüglich.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                11. Social Media (nur Verlinkung)
              </h2>
              <p className="mt-3">
                Wir verlinken auf unsere Profile bei Instagram und Facebook.
                Es sind reine Hyperlinks — es werden keine Social-Plugins
                geladen, die beim Seitenaufruf automatisch Daten an die
                Plattformen übermitteln. Erst wenn Sie den Link anklicken,
                gelangen Sie zur jeweiligen Plattform; dann gelten die
                Datenschutzbestimmungen des Anbieters.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Instagram / Meta:{" "}
                  <a
                    href="https://privacycenter.instagram.com/policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[color:var(--red)] underline-offset-2 hover:underline"
                  >
                    Datenschutzhinweise
                  </a>
                </li>
                <li>
                  Facebook / Meta:{" "}
                  <a
                    href="https://www.facebook.com/privacy/policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[color:var(--red)] underline-offset-2 hover:underline"
                  >
                    Datenschutzrichtlinie
                  </a>
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                12. Keine Analyse- / Marketing-Tools
              </h2>
              <p className="mt-3">
                Derzeit setzen wir keine Webanalyse-Tools (z. B. Google
                Analytics), kein Facebook-/Meta-Pixel und keine vergleichbaren
                Marketing-Tracker ein. Sollte sich das ändern, werden wir diese
                Erklärung aktualisieren und — soweit erforderlich — vorab Ihre
                Einwilligung einholen.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                13. Admin-Bereich / Progressive Web App
              </h2>
              <p className="mt-3">
                Für den Betreiber existiert ein passwortgeschützter
                Verwaltungsbereich. Dort können Inhalte der Website gepflegt und
                eingehende Kontaktanfragen eingesehen werden. Zugang und
                Sitzungs-Cookie dienen ausschließlich dem Betreiber. Optional kann
                der Verwaltungsbereich als App auf dem Gerät gespeichert werden
                (PWA); dabei können technische Dateien lokal zwischengespeichert
                werden.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                14. Empfänger und Auftragsverarbeitung
              </h2>
              <p className="mt-3">
                Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies
                für die genannten Zwecke erforderlich ist, Sie eingewilligt haben
                oder eine gesetzliche Pflicht besteht. Mögliche Empfänger bzw.
                Auftragsverarbeiter sind insbesondere:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Hosting-Anbieter (Vercel)</li>
                <li>E-Mail-/SMTP-Dienstleister (Zustellung von Anfragen)</li>
                <li>
                  Google Ireland Limited / Google LLC — nur bei Einwilligung in
                  Google Maps
                </li>
              </ul>
              <p className="mt-3">
                Mit Auftragsverarbeitern schließen wir — soweit gesetzlich
                erforderlich — Vereinbarungen nach Art. 28 DSGVO.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                15. Speicherdauer
              </h2>
              <p className="mt-3">
                Wir speichern personenbezogene Daten nur so lange, wie es für den
                jeweiligen Zweck erforderlich ist oder gesetzliche Fristen
                bestehen. Typische Orientierung:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Server-Logs: in der Regel kurze, technisch bedingte Fristen
                  beim Hosting-Anbieter
                </li>
                <li>
                  Kontaktanfragen: bis zur abschließenden Bearbeitung, danach
                  Löschung oder Einschränkung, sofern keine Aufbewahrungspflichten
                  gelten
                </li>
                <li>
                  Einwilligungsstatus: bis Sie ihn ändern/löschen oder ein neuer
                  Consent-Mechanismus eingeführt wird
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                16. Sicherheit
              </h2>
              <p className="mt-3">
                Wir treffen angemessene technische und organisatorische Maßnahmen
                zum Schutz Ihrer Daten (u. a. TLS-Verschlüsselung, Zugriffsschutz
                für den Admin-Bereich, Begrenzung und Prüfung von Formularingaben).
                Absolute Sicherheit bei Übertragungen im Internet kann nicht
                gewährleistet werden.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                17. Keine automatisierte Entscheidungsfindung
              </h2>
              <p className="mt-3">
                Es findet keine automatisierte Entscheidungsfindung einschließlich
                Profiling im Sinne von Art. 22 DSGVO statt.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                18. Ihre Rechte
              </h2>
              <p className="mt-3">
                Sie haben gegenüber uns — soweit die gesetzlichen Voraussetzungen
                vorliegen — insbesondere folgende Rechte:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Auskunft (Art. 15 DSGVO)</li>
                <li>Berichtigung (Art. 16 DSGVO)</li>
                <li>Löschung (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen Verarbeitungen (Art. 21 DSGVO)</li>
                <li>
                  Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO) — mit
                  Wirkung für die Zukunft
                </li>
              </ul>
              <p className="mt-3">
                Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an{" "}
                <a href={business.emailHref} className="text-[color:var(--red)]">
                  {business.email}
                </a>
                .
              </p>
              <p className="mt-3">
                Außerdem haben Sie ein Beschwerderecht bei einer
                Datenschutzaufsichtsbehörde. Zuständig u. a. für Bayern:
              </p>
              <p className="mt-3 text-[color:var(--ink)]">
                Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)
                <br />
                Promenade 18
                <br />
                91522 Ansbach
                <br />
                <a
                  href="https://www.lda.bayern.de"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--red)] underline-offset-2 hover:underline"
                >
                  www.lda.bayern.de
                </a>
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                19. Kinder und Jugendliche
              </h2>
              <p className="mt-3">
                Unser Angebot richtet sich nicht gezielt an Kinder unter 16
                Jahren. Wir fordern wissentlich keine personenbezogenen Daten von
                Kindern an. Das Schüler-/Azubi-Mittagsangebot betrifft Jugendliche
                bzw. Auszubildende im Ladenbetrieb; Online erheben wir dafür keine
                besonderen Kategorien personenbezogener Daten.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-[color:var(--ink)]">
                20. Aktualität dieser Erklärung
              </h2>
              <p className="mt-3">
                Stand: {lastUpdated}. Wir passen diese Datenschutzerklärung an,
                wenn sich Website, eingesetzte Dienste oder Rechtslage ändern.
                Die jeweils aktuelle Fassung finden Sie stets unter dieser URL.
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
