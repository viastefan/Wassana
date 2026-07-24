import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";

const courses = [
  {
    title: "Grundkurs Thai-Küche",
    text: "Sechs Gerichte in einem Nachmittag: Currys, Suppen, Salate und vegetarische Klassiker — mit Warenkunde und Rezepten zum Mitnehmen.",
  },
  {
    title: "Privatkurs",
    text: "Ab zehn Personen kochen wir bei euch: für Geburtstage, Vereine oder Teams. Flexibel vor Ort, wenn die Küche passt.",
  },
  {
    title: "Catering",
    text: "Frisch und authentisch für Feiern und Events — dieselbe Qualität wie im Kurs, serviert für eure Gäste.",
  },
];

const dates = [
  { date: "05.09.2026", time: "16:00 Uhr", note: "Samstag · Regierungsplatz" },
  { date: "10.10.2026", time: "16:00 Uhr", note: "Samstag · Regierungsplatz" },
];

const spices = [
  "Galgant",
  "Heiliges Basilikum",
  "Zitronengras",
  "Limettenblätter",
  "Chili",
  "Koriander",
];

export default function Home() {
  return (
    <div id="top" className="site-shell bg-bg text-ink">
      <SiteHeader />

      <main>
        <section className="relative min-h-[100svh] overflow-hidden">
          <Image
            src="/images/hero.jpg"
            alt="Thai-Curry in einer Schale, angerichtet mit frischen Kräutern"
            fill
            priority
            className="hero-media object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--hero-overlay)" }}
            aria-hidden
          />

          <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-8 md:pb-20">
            <p className="hero-copy font-display text-[clamp(3rem,10vw,6.5rem)] leading-none text-white">
              Wassana
            </p>
            <h1 className="hero-copy-delay mt-5 max-w-xl text-[clamp(1.35rem,3.2vw,1.85rem)] font-light leading-snug text-white/95">
              Thai-Kochkurse — modern, schlicht, nah am Geschmack.
            </h1>
            <p className="hero-copy-delay-2 mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Gemeinsam kochen, lernen und genießen. Sechs Gerichte, frische
              Gewürze und Rezepte für zu Hause.
            </p>
            <div className="hero-copy-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#termine"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:bg-white/90"
              >
                Nächste Termine
              </a>
              <a
                href="#kontakt"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Anfragen
              </a>
            </div>
          </div>
        </section>

        <section id="kurse" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">
              Angebot
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-4xl leading-tight md:text-5xl">
              Kochen wie in der Thai-Küche — ohne Schnickschnack.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Jeder Kurs verbindet Warenkunde mit Praxis. Die Gerichte werden
              Gang für Gang zubereitet und direkt vor Ort gegessen. Zusätzliche
              Rezepte gehen mit nach Hause.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-8">
            {courses.map((course, index) => (
              <Reveal key={course.title} delay={(index % 3) as 0 | 1 | 2}>
                <article>
                  <p className="text-sm text-accent">0{index + 1}</p>
                  <h3 className="font-display mt-3 text-2xl">{course.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{course.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-bg-soft">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
                <Image
                  src="/images/ingredients.jpg"
                  alt="Frische Gewürze und Zutaten der thailändischen Küche"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <Reveal delay={1}>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">
                So läuft’s
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
                Effektiv kochen. Klar schmecken.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Gemüse ist vorbereitet — die Zeit gehört dem Würzen, Braten und
                Abschmecken. Alle Gerichte sind so gedacht, dass sie später in
                rund zehn Minuten gelingen.
              </p>
              <ul className="mt-8 space-y-3 border-t border-line pt-8">
                {[
                  "Dauer ca. 2,5–3 Stunden",
                  "Sechs Gerichte inkl. Verkostung",
                  "Rezeptunterlagen zum Mitnehmen",
                  "Schreibzeug bitte mitbringen",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-3xl font-light tracking-tight">
                49&nbsp;€ <span className="text-base text-muted">pro Person</span>
              </p>
            </Reveal>
          </div>
        </section>

        <section id="termine" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">
              Termine
            </p>
            <h2 className="font-display mt-3 text-4xl md:text-5xl">
              Nächste Kurse
            </h2>
          </Reveal>

          <div className="mt-12 space-y-0 border-y border-line">
            {dates.map((item, index) => (
              <Reveal key={item.date} delay={(index % 2) as 0 | 1}>
                <div className="flex flex-col gap-3 border-b border-line py-7 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-3xl md:text-4xl">
                      {item.date}
                    </p>
                    <p className="mt-1 text-muted">{item.note}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-lg">{item.time}</p>
                    <a
                      href="#kontakt"
                      className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                    >
                      Anmelden
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-8 max-w-2xl text-muted">
              Geschenkgutscheine sind erhältlich. Zahlung ist auch vor Ort beim
              Kurs möglich. Weitere Termine folgen laufend.
            </p>
          </Reveal>
        </section>

        <section id="ueber" className="bg-accent text-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-16 md:px-8 md:py-28">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.2em] text-white/65">
                Über Wassana
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
                Thai-Küche mit ruhiger Hand und klaren Aromen.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Bei Wassana steht der Geschmack im Vordergrund — frische
                Gewürze, verständliche Schritte und Gerichte, die man zu Hause
                wiedererkennt. Modern in der Form, traditionell im Kern.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/20 pt-8 sm:grid-cols-3">
                {spices.map((spice) => (
                  <p key={spice} className="text-sm tracking-wide text-white/85">
                    {spice}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">
              Atmosphäre
            </p>
            <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
              Ein Nachmittag, der nach Zitronengras duftet.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Von der ersten Pfanne bis zum letzten Gang bleibt der Fokus auf
              dem Wesentlichen: Zutaten verstehen, Techniken üben, gemeinsam
              essen.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="relative aspect-[5/4] overflow-hidden">
              <Image
                src="/images/curry.jpg"
                alt="Aromatische thailändische Speisen in Schalen"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </section>

        <section id="kontakt" className="border-t border-line bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.2em] text-muted">
                  Kontakt
                </p>
                <h2 className="font-display mt-3 text-4xl md:text-5xl">
                  Kursplatz anfragen
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
                  Schreib uns kurz, welchen Termin du möchtest — oder ob ein
                  Privatkurs bzw. Catering geplant ist.
                </p>

                <div className="mt-10 space-y-5">
                  <div>
                    <p className="text-sm text-muted">E-Mail</p>
                    <a
                      href="mailto:albert-ewen@gmx.de"
                      className="text-xl transition hover:text-accent"
                    >
                      albert-ewen@gmx.de
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Telefon</p>
                    <a
                      href="tel:+491636500992"
                      className="text-xl transition hover:text-accent"
                    >
                      0163 6500992
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Ort</p>
                    <p className="text-xl">Regierungsplatz 542</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={1}>
                <form
                  className="space-y-5"
                  action="mailto:albert-ewen@gmx.de"
                  method="post"
                  encType="text/plain"
                >
                  <label className="block">
                    <span className="mb-2 block text-sm text-muted">Name</span>
                    <input
                      name="name"
                      required
                      className="w-full border-b border-line bg-transparent py-3 outline-none transition focus:border-accent"
                      placeholder="Dein Name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-muted">E-Mail</span>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border-b border-line bg-transparent py-3 outline-none transition focus:border-accent"
                      placeholder="name@mail.de"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-muted">
                      Nachricht
                    </span>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      className="w-full resize-y border-b border-line bg-transparent py-3 outline-none transition focus:border-accent"
                      placeholder="Termin, Personenanzahl oder Anliegen"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-4 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-hover"
                  >
                    Nachricht senden
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-display text-2xl">Wassana</p>
          <p className="text-sm text-muted">
            Thai-Kochkurse · Privatkurse · Catering
          </p>
        </div>
      </footer>
    </div>
  );
}
