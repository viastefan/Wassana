import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LocationSection } from "@/components/LocationSection";
import { Reveal } from "@/components/Reveal";
import { Wochenkarte } from "@/components/Speisekarte";

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
          <p className="hero-copy font-display text-[clamp(3.4rem,11vw,6.75rem)] leading-[0.92] text-white">
            Wassana
          </p>
          <p className="hero-copy-delay mt-3 text-sm tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
            Thai Imbiss · Landshut
          </p>
          <h1 className="hero-copy-delay mt-6 max-w-lg text-[clamp(1.15rem,2.4vw,1.45rem)] font-light leading-relaxed text-white/92">
            Sawasdee — willkommen im Gewerbehaus am Regierungsplatz.
          </h1>
          <p className="hero-copy-delay-2 mt-4 max-w-md text-[0.98rem] leading-relaxed text-white/72">
            Curries, Wok und Suppen. Frisch. Authentisch. Auch zum Mitnehmen.
          </p>
          <div className="hero-copy-delay-2 mt-9 flex flex-wrap gap-3">
            <Link href="/speisekarte" className="btn-primary">
              Speisekarte
            </Link>
            <a href="#standort" className="inline-flex items-center justify-center rounded-full border border-white/40 px-[1.35rem] py-3 text-[0.9rem] font-medium text-white transition hover:bg-white/10">
              Standort
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--bg-soft)]" aria-label="Angebot">
        <div className="mx-auto grid max-w-6xl gap-0 px-5 md:grid-cols-3 md:px-8">
          {[
            {
              title: "Speisekarte",
              text: "Wochenkarte und Klassiker.",
              href: "/speisekarte",
            },
            {
              title: "Catering",
              text: "Events inkl. Geschirr.",
              href: "/catering",
            },
            {
              title: "Kochkurs",
              text: "Drei Stunden Thai kochen.",
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

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Wochenkarte compact />
      </section>

      <LocationSection />
    </main>
  );
}
