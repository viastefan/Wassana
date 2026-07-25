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
  splitCourseLines,
} from "@/lib/cooking-course";
import { alternateCourseImage } from "@/lib/cooking-course-shared";
import { fillTemplate, getSitePages } from "@/lib/site-pages";

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
  const [course, business, pages] = await Promise.all([
    getCookingCourse(),
    getResolvedBusiness(),
    getSitePages(),
  ]);
  const copy = pages.kochkurs;
  const showNext = isPublicPromoVisible(course);
  const image = sanitizeCourseImage(course.image);
  const midImage = alternateCourseImage(image);
  const pageTitle =
    course.pageTitle?.trim() || "Thai-Küche näher kennenlernen";
  const pageText =
    course.pageText?.trim() ||
    "Schritt für Schritt Pad Thai oder Tom Yam — inkl. Tipps, wo Sie die Zutaten finden.";

  const facts = [
    course.date
      ? { label: copy.factTermin, value: formatCourseDate(course.date) }
      : null,
    course.startTime?.trim()
      ? {
          label: copy.factBeginn,
          value: `${course.startTime.trim()} Uhr`,
        }
      : null,
    course.duration?.trim()
      ? { label: copy.factDauer, value: course.duration.trim() }
      : null,
    course.price?.trim()
      ? { label: copy.factPreis, value: course.price.trim() }
      : null,
    course.maxParticipants?.trim()
      ? {
          label: copy.factPlaetze,
          value: `max. ${course.maxParticipants.trim()}`,
        }
      : null,
    course.level?.trim()
      ? { label: copy.factNiveau, value: course.level.trim() }
      : null,
    course.dishFocus?.trim()
      ? { label: copy.factGericht, value: course.dishFocus.trim() }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const includes = splitCourseLines(course.includes);
  const whatToBring = splitCourseLines(course.whatToBring);
  const locationNote = course.locationNote?.trim() || "";
  const hasDetails =
    includes.length > 0 || whatToBring.length > 0 || Boolean(locationNote);

  const dishLabel =
    course.dishFocus?.trim() || "Klassiker wie Pad Thai oder Tom Yam";
  const flowSteps = copy.flowSteps.map((step) => ({
    label: step.label,
    value: fillTemplate(step.value, { dish: dishLabel }),
  }));

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
        eyebrow={copy.heroEyebrow}
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
              {course.startTime?.trim()
                ? ` · ab ${course.startTime.trim()} Uhr`
                : null}
              {course.title ? ` — ${course.title}` : null}
              {course.teaser ? ` · ${course.teaser}` : null}
              {course.price?.trim() ? ` · ${course.price.trim()}` : null}
            </p>
          </div>
        </div>
      ) : null}

      {showNext && facts.length > 0 ? (
        <section
          className="course-facts-band"
          aria-label="Kursdetails auf einen Blick"
        >
          <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
            <dl className="course-facts-grid">
              {facts.map((fact) => (
                <div key={fact.label} className="course-fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
          <div className="relative min-h-[240px] md:min-h-[320px]">
            <Image
              src={midImage}
              alt="Thai-Gerichte und Atmosphäre beim Kochkurs bei Wassana"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center bg-[color:var(--paper)] px-5 py-12 md:px-10 md:py-16">
            <Reveal>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                {copy.midEyebrow}
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

      {showNext && hasDetails ? (
        <section
          className="course-details-band"
          aria-labelledby="course-details-heading"
        >
          <div className="mx-auto max-w-6xl px-5 py-[var(--section-y)] md:px-8">
            <Reveal>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                {copy.detailsEyebrow}
              </p>
              <h2
                id="course-details-heading"
                className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl"
              >
                {copy.detailsTitle}
              </h2>
            </Reveal>
            <div className="course-details-grid mt-10">
              {includes.length > 0 ? (
                <Reveal>
                  <h3 className="course-details-title">{copy.includesTitle}</h3>
                  <ul className="course-details-list">
                    {includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
              {whatToBring.length > 0 ? (
                <Reveal delay={1}>
                  <h3 className="course-details-title">{copy.bringTitle}</h3>
                  <ul className="course-details-list">
                    {whatToBring.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
              {locationNote ? (
                <Reveal
                  delay={includes.length > 0 && whatToBring.length > 0 ? 2 : 1}
                >
                  <h3 className="course-details-title">{copy.meetupTitle}</h3>
                  <p className="course-details-text">{locationNote}</p>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="course-flow-band" aria-labelledby="course-flow-heading">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-[var(--section-y)] md:grid-cols-2 md:items-start md:gap-16 md:px-8">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              {copy.flowEyebrow}
            </p>
            <h2
              id="course-flow-heading"
              className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl"
            >
              {copy.flowTitle}
            </h2>
            <p className="mt-4 max-w-md text-[color:var(--muted)] leading-relaxed">
              {copy.flowLead}
            </p>

            <ol className="course-flow-list">
              {flowSteps.map((item, index) => (
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
                {copy.ctaEmail}
              </a>
              <a href={business.phoneHref} className="btn-gold">
                {copy.ctaCall}
              </a>
            </div>
            <p className="mt-6 text-sm text-[color:var(--muted)]">
              {copy.formAltBefore}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                {copy.formAltLink}
              </Link>
              {copy.formAltAfter}
            </p>
          </Reveal>
          <div className="side-form-sticky">
            <ContactForm
              subject={copy.formSubject}
              title={copy.formTitle}
              intro={copy.formIntro}
              source="kochkurs"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
