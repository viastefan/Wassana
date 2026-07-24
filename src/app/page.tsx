import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Speisekarte } from "@/components/Speisekarte";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Thailändisches Gericht bei Wassana"
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
          <Image
            src="/images/logo.jpg"
            alt=""
            width={120}
            height={120}
            className="hero-copy mb-5 h-20 w-20 rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.25)] md:h-24 md:w-24"
            aria-hidden
          />
          <p className="hero-copy font-display text-[clamp(3rem,9vw,6rem)] leading-none text-white">
            Wassana
          </p>
          <p className="hero-copy-delay mt-2 text-sm tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
            Thai Imbiss · Landshut
          </p>
          <h1 className="hero-copy-delay mt-5 max-w-2xl text-[clamp(1.25rem,3vw,1.75rem)] font-light leading-snug text-white/95">
            Sawasdee und herzlich willkommen im Wassana Thai Imbiss im
            Gewerbehaus am Regierungsplatz.
          </h1>
          <p className="hero-copy-delay-2 mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Authentische Gerichte aus thailändischen Curries, verschiedene
            Wok-Gerichte und Suppen — gerne auch zum Mitnehmen.
          </p>
          <div className="hero-copy-delay-2 mt-8 flex flex-wrap gap-3">
            <a href="#speisekarte" className="btn-primary">
              Zur Speisekarte
            </a>
            <Link
              href="/kochkurs"
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-[1.4rem] py-3 text-[0.9rem] font-medium text-white transition hover:bg-white/10"
            >
              Kochkurs
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8 md:py-20">
          {[
            {
              title: "Speisekarte",
              text: "Wochenkarte und Klassiker — Currys, Wok, Suppen und mehr.",
              href: "#speisekarte",
              cta: "Ansehen",
            },
            {
              title: "Catering",
              text: "Für Events und Feiern: Menü nach Wunsch inkl. Geschirr.",
              href: "/catering",
              cta: "Anfragen",
            },
            {
              title: "Kochkurs",
              text: "In drei Stunden Pad Thai, Tom Yam und mehr gemeinsam kochen.",
              href: "/kochkurs",
              cta: "Mehr erfahren",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2}>
              <article className="border-t border-[color:var(--gold)] pt-5">
                <h2 className="font-display text-2xl text-[color:var(--red)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-[color:var(--muted)]">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex text-sm font-medium text-[color:var(--red)] underline-offset-4 hover:underline"
                >
                  {item.cta}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Speisekarte />

      <section className="border-t border-[color:var(--line)] bg-[color:var(--paper)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
              Öffnungszeiten
            </p>
            <p className="font-display mt-2 text-3xl text-[color:var(--red)]">
              {site.hours.weekdays}
            </p>
            <p className="mt-2 text-[color:var(--muted)]">{site.hours.weekend}</p>
          </div>
          <a href={site.phoneHref} className="btn-primary">
            Anrufen · {site.phone}
          </a>
        </div>
      </section>
    </main>
  );
}
