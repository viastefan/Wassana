import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqSection } from "@/components/FaqSection";
import {
  JsonLdBreadcrumbs,
  JsonLdFaqPage,
} from "@/components/JsonLd";
import { SplitMedia } from "@/components/Media";
import { LocationSection } from "@/components/LocationSection";
import { Reveal } from "@/components/Reveal";
import { Wochenkarte } from "@/components/Speisekarte";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { getSitePages } from "@/lib/site-pages";
import { getWeeklyMenuData } from "@/lib/weekly-menu-store";

export const dynamic = "force-dynamic";

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

const offerImages = [
  "/images/curry.jpg",
  "/images/ingredients.jpg",
  "/images/soup.jpg",
] as const;

export default async function HomePage() {
  const [content, pages, weekly, business] = await Promise.all([
    getSiteContent(),
    getSitePages(),
    getWeeklyMenuData(),
    getResolvedBusiness(),
  ]);
  const home = pages.home;

  const closingText =
    content.closing.text.trim() ||
    `${business.street}, ${business.city} — ${content.hours.weekdaysLong}. ${content.hours.weekend}.`;

  return (
    <main>
      <JsonLdBreadcrumbs items={[{ name: "Start", path: "/" }]} />
      <JsonLdFaqPage items={pages.faqs} />
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
          <p className="hero-copy text-sm tracking-[0.22em] text-[color:var(--gold-soft)] uppercase md:text-[0.95rem]">
            {content.hero.eyebrow.trim() ||
              "Thai Imbiss und Feinkost · Landshut"}
          </p>
          <h1 className="hero-copy-delay font-display mt-3 text-[clamp(3.4rem,11vw,6.75rem)] leading-[0.92] text-white">
            {home.heroTitleLine1}
            <br />
            {home.heroTitleLine2}
          </h1>
          <p className="hero-copy-delay mt-5 max-w-md text-[clamp(1.05rem,2.1vw,1.3rem)] font-light leading-relaxed text-white/90">
            {content.hero.lede}
          </p>
          <a
            href={business.maps.directions}
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
                {business.street}
              </span>
              <span className="mt-0.5 block text-sm text-white/70">
                {business.zip} {business.city} {home.routeHint}
              </span>
            </span>
          </a>
          <div className="hero-copy-delay-2 mt-9 flex flex-wrap gap-3">
            <Link href="/speisekarte" className="btn-primary">
              {home.ctaMenu}
            </Link>
            <a href="#standort" className="btn-ghost">
              {home.ctaMap}
            </a>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="wassana-heading"
        className="border-b border-[color:var(--line)] bg-[color:var(--paper)]"
      >
        <div className="mx-auto max-w-3xl px-5 py-[var(--section-y)] text-center md:px-8">
          <Reveal>
            <div className="brand-mark mx-auto">
              <Image
                src="/images/logo.png"
                alt="Wassana Thai Imbiss Logo"
                width={160}
                height={160}
                className="mx-auto h-28 w-28 rounded-full object-contain md:h-32 md:w-32"
              />
            </div>
            <h2
              id="wassana-heading"
              className="font-display mt-8 text-[clamp(2.4rem,7vw,3.75rem)] leading-none text-[color:var(--red)] md:mt-9"
            >
              {home.brandName}
            </h2>
            <p className="mt-4 text-sm tracking-[0.22em] text-[color:var(--gold)] uppercase">
              {home.brandTagline}
            </p>
            <div className="gold-rule mx-auto mt-8 max-w-xs" />
            <p className="mt-8 text-lg leading-relaxed text-[color:var(--ink)] md:text-xl">
              {content.meaning}
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
            {home.kitchenEyebrow}
          </p>
          <h2 className="font-display mt-4 text-3xl text-[color:var(--red)] md:text-4xl">
            {home.kitchenTitle}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[color:var(--ink)]">
            {home.kitchenP1}
          </p>
          <p className="mt-4 text-[color:var(--muted)] leading-relaxed">
            {home.kitchenP2}
          </p>
          <Link href="/speisekarte" className="btn-primary mt-8 w-fit">
            {home.kitchenCta}
          </Link>
        </Reveal>
      </SplitMedia>

      <section className="offer-strip" aria-label="Angebot">
        <div className="offer-strip-rail">
          {home.offers.map((item, index) => (
            <Reveal
              key={item.href}
              delay={(index % 3) as 0 | 1 | 2}
              className="offer-strip-cell"
            >
              <Link href={item.href} className="offer-link">
                <span className="offer-link-media" aria-hidden>
                  <Image
                    src={offerImages[index] ?? offerImages[0]}
                    alt=""
                    fill
                    className="offer-link-image object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="offer-link-media-veil" />
                </span>
                <span className="offer-link-body">
                  <span className="offer-link-index">0{index + 1}</span>
                  <h2 className="offer-link-title">{item.title}</h2>
                  <p className="offer-link-text">{item.text}</p>
                  <span className="offer-link-cta">
                    {home.offersCta}
                    <span aria-hidden className="offer-link-arrow">
                      →
                    </span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="takeaway-band" aria-labelledby="takeaway-heading">
        <Image
          src="/images/hero.jpg"
          alt="Frisch zubereitetes Thai-Gericht zum Mitnehmen bei Wassana"
          fill
          className="takeaway-band-image object-cover"
          sizes="100vw"
        />
        <div className="takeaway-band-veil" aria-hidden />
        <div className="takeaway-band-copy">
          <Reveal>
            <p className="takeaway-band-eyebrow">{home.takeawayEyebrow}</p>
            <h2 id="takeaway-heading" className="takeaway-band-title">
              {home.takeawayTitleLine1}
              <br />
              {home.takeawayTitleLine2}
            </h2>
            <p className="takeaway-band-text">{home.takeawayText}</p>
            <div className="takeaway-band-actions">
              <Link href="/mitnehmen" className="btn-primary">
                {home.takeawayCta1}
              </Link>
              <Link href="/speisekarte" className="btn-ghost">
                {home.takeawayCta2}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LocationSection location={content.location} hours={content.hours} />

      <section className="mx-auto max-w-6xl px-5 py-[var(--section-y)] md:px-8">
        <Wochenkarte compact menu={weekly} labels={pages.speisekarteUi} />
      </section>

      <FaqSection
        items={pages.faqs}
        eyebrow={home.faqEyebrow}
        title={home.faqTitle}
        lead={home.faqLead}
      />

      <section className="closing-band border-t border-[color:var(--line)]">
        <div className="mx-auto max-w-2xl px-5 py-[var(--section-y)] text-center md:px-8">
          <Reveal>
            <p className="font-display text-3xl text-[color:var(--red)] md:text-4xl">
              {content.closing.title}
            </p>
            <p className="mt-4 text-[color:var(--muted)] leading-relaxed">
              {closingText}
            </p>
            <a href={business.phoneHref} className="btn-primary mt-8 inline-flex">
              {business.phone}
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
