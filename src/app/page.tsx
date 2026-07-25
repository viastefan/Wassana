import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageStrip, SplitMedia } from "@/components/Media";
import { LocationSection } from "@/components/LocationSection";
import { Reveal } from "@/components/Reveal";
import { Wochenkarte } from "@/components/Speisekarte";
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
          <p className="hero-copy font-display text-[clamp(3.4rem,11vw,6.75rem)] leading-[0.92] text-white">
            Wassana
          </p>
          <p className="hero-copy-delay mt-3 text-sm tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
            Thai Imbiss und Feinkost · Landshut
          </p>
          <h1 className="hero-copy-delay mt-6 max-w-xl text-[clamp(1.15rem,2.4vw,1.45rem)] font-light leading-relaxed text-white/92">
            Sawasdee — willkommen bei Wassana am Regierungsplatz.
          </h1>
          <div className="hero-copy-delay-2 mt-9 flex flex-wrap gap-3">
            <Link href="/speisekarte" className="btn-primary">
              Speisekarte
            </Link>
            <a href="#standort" className="btn-ghost">
              Standort
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
              alt=""
              width={72}
              height={72}
              className="mx-auto h-16 w-16 rounded-full object-contain"
            />
            <h2
              id="wassana-heading"
              className="font-display mt-6 text-[clamp(2.4rem,7vw,3.75rem)] leading-none text-[color:var(--red)]"
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

      <ImageStrip
        items={[
          {
            src: "/images/soup.jpg",
            alt: "Thai-Suppe",
            label: "Speisekarte",
            href: "/speisekarte",
          },
          {
            src: "/images/ingredients.jpg",
            alt: "Frische Zutaten",
            label: "Kochkurs",
            href: "/kochkurs",
          },
          {
            src: "/images/hero.jpg",
            alt: "Thai-Gericht zum Mitnehmen",
            label: "Catering",
            href: "/catering",
          },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Wochenkarte compact />
      </section>

      <section className="closing-band">
        <Image
          src="/images/ingredients.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="closing-band-veil" aria-hidden />
        <div className="closing-band-copy">
          <Reveal>
            <p className="font-display text-3xl md:text-4xl">
              Bis bald bei Wassana
            </p>
            <p className="mt-4 leading-relaxed text-white/80">
              {site.hours.weekdaysLong}. {site.hours.weekend}.
            </p>
            <a href={site.phoneHref} className="btn-primary mt-8 inline-flex">
              {site.phone}
            </a>
          </Reveal>
        </div>
      </section>

      <LocationSection />
    </main>
  );
}
