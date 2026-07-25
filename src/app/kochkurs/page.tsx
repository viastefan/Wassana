import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import {
  JsonLdBreadcrumbs,
  JsonLdCookingCourseEvent,
} from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";
import {
  formatCourseDate,
  getCookingCourse,
  isPublicPromoVisible,
  sanitizeCourseImage,
} from "@/lib/cooking-course";

export const metadata: Metadata = {
  title: "Thai Kochkurs Landshut",
  description:
    "Thai Kochkurs in Landshut bei Wassana: Schritt für Schritt Pad Thai oder Tom Yam zubereiten — inkl. Tipps zu Zutaten.",
  alternates: { canonical: "/kochkurs" },
  openGraph: {
    title: "Thai Kochkurs Landshut | Wassana",
    description: "Gemeinsam berühmte Thai-Gerichte kochen lernen.",
    url: "/kochkurs",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function KochkursPage() {
  const [course, business] = await Promise.all([
    getCookingCourse(),
    getResolvedBusiness(),
  ]);
  const showNext = isPublicPromoVisible(course);
  const image = sanitizeCourseImage(course.image);
  const pageTitle =
    course.pageTitle?.trim() || "Thai-Küche näher kennenlernen";
  const pageText =
    course.pageText?.trim() ||
    "Schritt für Schritt Pad Thai oder Tom Yam — inkl. Tipps, wo Sie die Zutaten finden.";

  return (
    <main>
      <JsonLdBreadcrumbs
        items={[
          { name: "Start", path: "/" },
          { name: "Kochkurs", path: "/kochkurs" },
        ]}
      />
      {showNext ? (
        <JsonLdCookingCourseEvent course={course} business={business} />
      ) : null}
      <MediaBand
        src={image}
        alt={`${course.title || "Thai Kochkurs"} bei Wassana in Landshut`}
        eyebrow="Kochkurs Landshut"
        title={pageTitle}
        text={pageText}
        priority
        height="short"
      />

      {showNext ? (
        <div className="border-b border-[color:var(--line)] bg-[color:var(--paper)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 md:flex-row md:items-baseline md:justify-between md:px-8">
            <p className="text-[color:var(--ink)]">
              Nächster Termin:{" "}
              <strong className="text-[color:var(--red)]">
                {formatCourseDate(course.date)}
              </strong>
              {course.title ? ` — ${course.title}` : null}
              {course.teaser ? ` · ${course.teaser}` : null}
            </p>
          </div>
        </div>
      ) : null}

      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
          <div className="relative min-h-[240px] md:min-h-[320px]">
            <Image
              src={image}
              alt="Atmosphäre beim Thai Kochkurs bei Wassana"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center bg-[color:var(--paper)] px-5 py-12 md:px-10 md:py-16">
            <Reveal>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                Bei Wassana
              </p>
              <h2 className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl">
                {course.title || "Thai Kochkurs"}
              </h2>
              <p className="mt-4 max-w-md text-[color:var(--muted)] leading-relaxed">
                {pageText}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="course-flow-band" aria-labelledby="course-flow-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-[var(--section-y)] md:grid-cols-2 md:gap-16 md:px-8">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              So läuft es
            </p>
            <h2
              id="course-flow-heading"
              className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl"
            >
              Vom ersten Schnitt bis zum Teller
            </h2>
            <p className="mt-4 max-w-md text-[color:var(--muted)] leading-relaxed">
              Ein Abend bei Wassana in Landshut — gemeinsam kochen, lernen und
              genießen. Zutaten und Anleitung sind dabei.
            </p>

            <ol className="course-flow-list">
              {[
                {
                  label: "Ankommen",
                  value:
                    "Wir begrüßen euch in der Küche, stellen den Ablauf vor und gehen die Zutaten gemeinsam durch.",
                },
                {
                  label: "Kochen",
                  value:
                    "Schritt für Schritt bereitet ihr Klassiker wie Pad Thai oder Tom Yam zu — mit Tipps zur Schärfe und Würzung.",
                },
                {
                  label: "Genießen & mitnehmen",
                  value:
                    "Am Ende probiert ihr euer Gericht und bekommt Tipps, wo ihr die Zutaten später selbst findet.",
                },
              ].map((item, index) => (
                <li key={item.label} className="course-flow-item">
                  <span className="course-flow-index" aria-hidden>
                    0{index + 1}
                  </span>
                  <div>
                    <p className="course-flow-label">{item.label}</p>
                    <p className="course-flow-text">{item.value}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href={business.cookingEmailHref} className="btn-primary">
                Per E-Mail anfragen
              </a>
              <a href={business.phoneHref} className="btn-gold">
                Anrufen
              </a>
            </div>
            <p className="mt-6 text-sm text-[color:var(--muted)]">
              Auch über das{" "}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                Kontaktformular
              </Link>{" "}
              möglich.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <ContactForm
              subject="Kochkurs Anfrage Landshut"
              title="Kursplatz anfragen"
              intro="Name, Personenanzahl und Wunschtermin reichen völlig."
              source="kochkurs"
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
