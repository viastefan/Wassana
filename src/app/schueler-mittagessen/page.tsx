import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  JsonLdBreadcrumbs,
  JsonLdFaqPage,
  JsonLdWebPage,
} from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import { pageMetadata } from "@/lib/seo-metadata";
import { getSiteContent } from "@/lib/site-content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Schüler Mittagessen Landshut",
  description:
    "Schüler- und Azubi-Mittagessen bei Wassana in Landshut: Mo–Fr Gericht der Woche inkl. Softgetränk, ab 8,90 € — gegen Ausweis. Am Regierungsplatz.",
  path: "/schueler-mittagessen",
  keywords: [
    "Schüler Mittagessen Landshut",
    "Mittagessen Schüler Landshut",
    "Azubi Mittagessen Landshut",
    "günstig Mittagessen Landshut",
    "Thai Mittagessen Landshut",
  ],
  image: {
    url: "/images/curry.jpg",
    width: 1600,
    height: 1067,
    alt: "Schüler-Mittagessen bei Wassana Thai Imbiss in Landshut",
  },
});

const PAGE_DESCRIPTION =
  "Schüler- und Azubi-Mittagessen bei Wassana in Landshut: Mo–Fr Gericht der Woche inkl. Softgetränk, ab 8,90 € — gegen Ausweis. Am Regierungsplatz.";

const faqs = [
  {
    question: "Was kostet das Schüler-Mittagessen bei Wassana in Landshut?",
    answer: `${site.studentLunch.price} — Gericht der Woche plus Softgetränk, Mo–Fr mittags.`,
  },
  {
    question: "Wer darf das Schüler- und Azubi-Angebot nutzen?",
    answer:
      "Schülerinnen, Schüler und Azubis — gegen Vorlage eines gültigen Schüler- oder Azubi-Ausweises.",
  },
  {
    question: "Kann ich das Schüler-Mittagessen auch mitnehmen?",
    answer:
      "Ja. Das Angebot gibt es frisch zum Mitnehmen oder zum Abholen am Regierungsplatz 542 in Landshut.",
  },
];

const crumbs = [
  { name: "Start", path: "/" },
  { name: "Schüler Mittagessen", path: "/schueler-mittagessen" },
];

export default async function SchuelerMittagessenPage() {
  const [business, content] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
  ]);
  const offer = content.studentLunch;

  return (
    <main>
      <JsonLdBreadcrumbs items={crumbs} />
      <JsonLdWebPage
        name="Schüler Mittagessen Landshut | Wassana"
        description={PAGE_DESCRIPTION}
        path="/schueler-mittagessen"
      />
      <JsonLdFaqPage items={faqs} />

      <MediaBand
        src="/images/curry.jpg"
        alt="Schüler-Mittagessen und Thai-Gerichte bei Wassana in Landshut"
        eyebrow="Schüler & Azubis · Landshut"
        title="Schüler Mittagessen"
        text={`${offer.text} ${offer.price}. ${offer.note}`}
        priority
        height="short"
      />

      <section className="border-b border-[color:var(--line)] bg-[color:var(--paper)]">
        <div className="mx-auto max-w-3xl px-5 py-[var(--section-y)] md:px-8">
          <Breadcrumbs items={crumbs} />
          <Reveal>
            <div className="space-y-8 text-[color:var(--muted)] leading-relaxed">
              <section>
                <h2 className="font-display text-2xl text-[color:var(--ink)] md:text-3xl">
                  Günstig mittags bei Wassana
                </h2>
                <p className="mt-3">
                  Am{" "}
                  <strong className="text-[color:var(--ink)]">
                    {business.street}, {business.zip} {business.city}
                  </strong>{" "}
                  gibt es Mo–Fr ein Schüler- und Azubi-Mittagessen: ein Gericht
                  der beliebten Gerichte der Woche plus Softgetränk —{" "}
                  <strong className="text-[color:var(--red)]">
                    {offer.price}
                  </strong>
                  .
                </p>
                <p>
                  Ideal für die Pause in der Altstadt oder zum Mitnehmen nach
                  der Schule bzw. Ausbildung.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[color:var(--ink)] md:text-3xl">
                  Wann und für wen?
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>{content.hours.weekdaysLong}</li>
                  <li>{offer.note}</li>
                  <li>Frisch zubereitet — gerne zum Mitnehmen</li>
                </ul>
              </section>

              <section aria-labelledby="schueler-faq-heading">
                <h2
                  id="schueler-faq-heading"
                  className="font-display text-2xl text-[color:var(--ink)] md:text-3xl"
                >
                  Häufige Fragen
                </h2>
                <div className="mt-4 space-y-3">
                  {faqs.map((item) => (
                    <details
                      key={item.question}
                      className="border-b border-[color:var(--line)] pb-3"
                    >
                      <summary className="cursor-pointer text-[color:var(--ink)]">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/?mittag=1" className="btn-primary">
                  Angebot ansehen
                </Link>
                <Link href="/speisekarte#wochenkarte" className="btn-gold">
                  Beliebte Gerichte
                </Link>
                <a href={business.phoneHref} className="btn-gold">
                  {business.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
