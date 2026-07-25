import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SplitMedia } from "@/components/Media";
import { LocationSection } from "@/components/LocationSection";
import { Reveal } from "@/components/Reveal";
import { Wochenkarte } from "@/components/Speisekarte";
import { StudentLunch } from "@/components/StudentLunch";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Wassana Thai Imbiss Landshut | Curry, Wok & Mitnehmen",
  },
  description:
    "Thai Imbiss Wassana in Landshut: Massaman, Panaeng, Pad kra pao und mehr am Regierungsplatz. Mo–Fr 11–18 Uhr — frisch und zum Mitnehmen.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wassana Thai Imbiss Landshut",
    description:
      "Glück und gutes Schicksal — authentische Thai-Küche in Landshut.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
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
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
          <p className="hero-copy text-sm tracking-[0.28em] text-[color:var(--gold-soft)] uppercase">
            Thai Imbiss · Landshut
          </p>
          <h1 className="hero-copy-delay font-display mt-4 text-[clamp(3.4rem,11vw,6.75rem)] leading-[0.92] text-white">
            Wassana
          </h1>
          <p className="hero-copy-delay mt-6 max-w-md text-[clamp(1.05rem,2.1vw,1.3rem)] font-light leading-relaxed text-white/90">
            Frisch gekocht am Regierungsplatz — Curry, Wok und Mitnehmen.
          </p>
          <a
            href={site.maps.directions}
            target="_blank"
            rel="noreferrer"
            className="hero-copy-delay-2 group mt-7 inline-flex max-w-fit items-start gap-2.5 text-white/88 transition hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-[color:var(--gold-soft)] transition group-hover:translate-y-[-1px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
              />
              <circle cx="12" cy="10" r="2.25" />
            </svg>
            <span className="text-left leading-snug">
              <span className="block text-[0.95rem] tracking-wide md:text-base">
                {site.address.street}
              </span>
              <span className="mt-0.5 block text-sm text-white/70">
                {site.address.zip} {site.address.city} · Route öffnen
              </span>
            </span>
          </a>
          <div className="hero-copy-delay-2 mt-9 flex flex-wrap gap-3">
            <Link href="/speisekarte" className="btn-primary">
              Speisekarte
            </Link>
            <a href="#standort" className="btn-ghost">
              Auf der Karte
            </a>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="wassana-heading"
        className="border-b border-[color:var(--line)] bg-[color:var(--paper)]"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-20">
          <Reveal>
            <Image
              src="/images/logo.png"
              alt="Wassana Thai Imbiss Logo"
              width={160}
              height={160}
              className="mx-auto h-28 w-28 rounded-full object-contain md:h-32 md:w-32"
            />
            <h2
              id="wassana-heading"
              className="font-display mt-7 text-[clamp(2.4rem,7vw,3.75rem)] leading-none text-[color:var(--red)] md:mt-8"
            >
              Wassana
            </h2>
            <p className="mt-4 text-sm tracking-[0.22em] text-[color:var(--gold)] uppercase">
              Glück und gutes Schicksal
            </p>
            <div className="gold-rule mx-auto mt-8 max-w-xs" />
            <p className="mt-8 text-lg leading-relaxed text-[color:var(--ink)] md:text-xl">
              {site.meaning}
            </p>
          </Reveal>
        </div>
      </section>

      <SplitMedia
        src="/images/curry.jpg"
        alt="Thai-Curry bei Wassana Thai Imbiss in Landshut"
        imageRight
      >
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Die Küche bei Wassana
          </p>
          <h2 className="font-display mt-4 text-3xl text-[color:var(--red)] md:text-4xl">
            Salzig, süß, sauer, scharf
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[color:var(--ink)]">
            Authentische Gerichte wie Massaman oder Panaeng Curries, verschiedene
            Wok-Gerichte und das berühmte Pad kra pao finden Sie bei uns auf der
            Karte.
          </p>
          <p className="mt-4 text-[color:var(--muted)] leading-relaxed">
            An bestimmten Tagen bieten wir auch besondere thailändische Gerichte
            an, die man sonst selten findet. Alle Speisen können gerne
            mitgenommen werden.
          </p>
          <Link href="/speisekarte" className="btn-primary mt-8 w-fit">
            Zur Speisekarte
          </Link>
        </Reveal>
      </SplitMedia>

      <StudentLunch />

      <section className="bg-[color:var(--bg-soft)]" aria-label="Angebot">
        <div className="mx-auto grid max-w-6xl gap-0 px-5 md:grid-cols-3 md:px-8">
          {[
            {
              title: "Speisekarte",
              text: "Wochenkarte und Klassiker bei Wassana.",
              href: "/speisekarte",
            },
            {
              title: "Catering",
              text: "Events inkl. Geschirr — von Wassana.",
              href: "/catering",
            },
            {
              title: "Kochkurs",
              text: "Schritt für Schritt Thai kochen mit Wassana.",
              href: "/kochkurs",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2}>
              <Link
                href={item.href}
                className="group block border-t border-[color:var(--line)] py-10 transition md:border-t-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
              >
                <p className="text-sm text-[color:var(--gold)]">0{index + 1}</p>
                <h2 className="font-display mt-3 text-2xl text-[color:var(--red)] transition group-hover:opacity-75">
                  {item.title}
                </h2>
                <p className="mt-2 text-[color:var(--muted)]">{item.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <LocationSection />

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Wochenkarte compact />
      </section>

      <section className="border-t border-[color:var(--line)] bg-[color:var(--paper)]">
        <div className="mx-auto max-w-2xl px-5 py-14 text-center md:px-8 md:py-16">
          <Reveal>
            <p className="font-display text-3xl text-[color:var(--red)] md:text-4xl">
              Bis bald bei Wassana
            </p>
            <p className="mt-4 text-[color:var(--muted)] leading-relaxed">
              {site.address.street}, {site.address.city} —{" "}
              {site.hours.weekdaysLong}. {site.hours.weekend}.
            </p>
            <a href={site.phoneHref} className="btn-primary mt-8 inline-flex">
              {site.phone}
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
