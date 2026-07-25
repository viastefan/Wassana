import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSitePages } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thai Catering Landshut",
  description:
    "Thai Catering in Landshut von Wassana: individueller Menüplan, Geschirr und frische Gerichte für Geburtstage, Firmenfeiern und Hochzeiten.",
  alternates: { canonical: "/catering" },
  openGraph: {
    title: "Thai Catering Landshut | Wassana",
    description:
      "Catering mit Thai-Küche für Events in Landshut — Menüplanung, Geschirr und frische Zubereitung.",
    url: "/catering",
  },
  robots: { index: true, follow: true },
};

export default async function CateringPage() {
  const [business, pages] = await Promise.all([
    getResolvedBusiness(),
    getSitePages(),
  ]);
  const copy = pages.catering;

  return (
    <main>
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "Catering", path: "/catering" },
        ]}
      />
      <MediaBand
        src="/images/soup.jpg"
        alt="Thai-Gerichte fürs Catering von Wassana"
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        text={copy.heroText}
        priority
        height="short"
      />

      <section className="offer-strip">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-[var(--section-y)] md:grid-cols-2 md:items-start md:gap-16 md:px-8">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              {copy.serviceEyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl text-[color:var(--ink)] md:text-4xl">
              {copy.serviceTitle}
            </h2>
            <p className="mt-4 max-w-md text-[color:var(--muted)] leading-relaxed">
              {copy.serviceLead}
            </p>

            <ul className="mt-9 space-y-6">
              {copy.offerings.map((item, index) => (
                <li key={`${item.title}-${index}`} className="flex gap-4">
                  <span
                    className="font-display mt-0.5 w-8 shrink-0 text-sm tracking-[0.12em] text-[color:var(--gold)]"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-snug text-[color:var(--red)]">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-[color:var(--muted)]">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href={business.cateringEmailHref} className="btn-primary">
                {copy.ctaEmail}
              </a>
              <a href={business.phoneHref} className="btn-gold">
                {copy.ctaCall}
              </a>
            </div>
            <p className="mt-6 text-sm text-[color:var(--muted)]">
              {copy.formHintBefore}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                {copy.formHintLink}
              </Link>
              {copy.formHintAfter}
            </p>
          </Reveal>
          <div className="side-form-sticky">
            <ContactForm
              subject={copy.formSubject}
              title={copy.formTitle}
              intro={copy.formIntro}
              source="catering"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
