import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Wochenkarte } from "@/components/Speisekarte";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Wassana Thai Imbiss Landshut | Curry, Wok & Mitnehmen",
  },
  description:
    "Thai Imbiss Wassana in Landshut: authentische Curries, Wok-Gerichte und Suppen am Regierungsplatz. Mo–Fr 11–18 Uhr — frisch und zum Mitnehmen.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wassana Thai Imbiss Landshut",
    description:
      "Authentische Thai-Küche in Landshut — Speisekarte, Catering und Kochkurs.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[92svh] overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Thai-Gericht zum Mitnehmen bei Wassana Thai Imbiss in Landshut"
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
        <div className="relative mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-8 md:pb-20">
          <Image
            src="/images/logo.jpg"
            alt=""
            width={96}
            height={96}
            className="hero-copy mb-5 h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
            aria-hidden
          />
          <p className="hero-copy font-display text-[clamp(3.2rem,10vw,6.2rem)] leading-none text-white">
            Wassana
          </p>
          <p className="hero-copy-delay mt-2 text-sm tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
            Thai Imbiss · Landshut
          </p>
          <h1 className="hero-copy-delay mt-5 max-w-xl text-[clamp(1.2rem,2.8vw,1.65rem)] font-light leading-snug text-white/95">
            Sawasdee — Thai Imbiss am Regierungsplatz in Landshut.
          </h1>
          <p className="hero-copy-delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/80">
            Authentische Curries, Wok-Gerichte und Suppen. Gerne auch zum
            Mitnehmen.
          </p>
          <div className="hero-copy-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/speisekarte" className="btn-primary">
              Speisekarte
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-full border border-white/45 px-[1.35rem] py-3 text-[0.9rem] font-medium text-white transition hover:bg-white/10"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--bg-soft)]" aria-label="Angebot">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3 md:px-8 md:py-16">
          {[
            {
              title: "Speisekarte Landshut",
              text: "Wochenkarte und alle Thai-Gerichte.",
              href: "/speisekarte",
            },
            {
              title: "Catering",
              text: "Events & Feiern inkl. Geschirr.",
              href: "/catering",
            },
            {
              title: "Kochkurs",
              text: "3 Stunden Thai kochen lernen.",
              href: "/kochkurs",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2}>
              <Link
                href={item.href}
                className="group block border-t border-[color:var(--gold)] pt-5 transition"
              >
                <h2 className="font-display text-2xl text-[color:var(--red)] transition group-hover:opacity-80">
                  {item.title}
                </h2>
                <p className="mt-2 text-[color:var(--muted)]">{item.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <Wochenkarte compact />
      </section>

      <section
        className="border-t border-[color:var(--line)] bg-[color:var(--paper)]"
        aria-label="Öffnungszeiten Landshut"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
              Öffnungszeiten Landshut
            </p>
            <p className="font-display mt-2 text-3xl text-[color:var(--red)]">
              {site.hours.weekdays}
            </p>
            <p className="mt-2 text-[color:var(--muted)]">{site.hours.weekend}</p>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              {site.address.street}, {site.address.zip} {site.address.city}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={site.phoneHref} className="btn-primary">
              Anrufen
            </a>
            <Link href="/kontakt" className="btn-gold">
              Nachricht senden
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
