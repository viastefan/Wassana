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
  const midImage = alternateCourseImage(image);
  const pageTitle =
    course.pageTitle?.trim() || "Thai-Küche näher kennenlernen";
  const pageText =
    course.pageText?.trim() ||
    "Schritt für Schritt Pad Thai oder Tom Yam — inkl. Tipps, wo Sie die Zutaten finden.";

  const facts = [
    course.date
      ? { label: "Termin", value: formatCourseDate(course.date) }
      : null,
    course.startTime?.trim()
      ? { label: "Beginn", value: `${course.startTime.trim()} Uhr` }
      : null,
    course.duration?.trim()
      ? { label: "Dauer", value: course.duration.trim() }
      : null,
    course.price?.trim()
      ? { label: "Preis", value: course.price.trim() }
      : null,
    course.maxParticipants?.trim()
      ? {
          label: "Plätze",
          value: `max. ${course.maxParticipants.trim()}`,
        }
      : null,
    course.level?.trim()
      ? { label: "Niveau", value: course.level.trim() }
      : null,
    course.dishFocus?.trim()
      ? { label: "Gericht", value: course.dishFocus.trim() }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const includes = splitCourseLines(course.includes);
  const whatToBring = splitCourseLines(course.whatToBring);
  const locationNote = course.locationNote?.trim() || "";
  const hasDetails =
    includes.length > 0 || whatToBring.length > 0 || Boolean(locationNote);

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

      {showNext && hasDetails ? (
        <section
          className="course-details-band"
          aria-labelledby="course-details-heading"
        >
          <div className="mx-auto max-w-6xl px-5 py-[var(--section-y)] md:px-8">
            <Reveal>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                Gut zu wissen
              </p>
              <h2
                id="course-details-heading"
                className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl"
              >
                Was dich erwartet
              </h2>
            </Reveal>
            <div className="course-details-grid mt-10">
              {includes.length > 0 ? (
                <Reveal>
                  <h3 className="course-details-title">Inklusive</h3>
                  <ul className="course-details-list">
                    {includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
              {whatToBring.length > 0 ? (
                <Reveal delay={1}>
                  <h3 className="course-details-title">Bitte mitbringen</h3>
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
                  <h3 className="course-details-title">Treffpunkt</h3>
                  <p className="course-details-text">{locationNote}</p>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="course-flow-band" aria-labelledby="course-flow-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-[var(--section-y)] md:grid-cols-2 md:items-start md:gap-16 md:px-8">
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
                  value: course.dishFocus?.trim()
                    ? `Schritt für Schritt bereitet ihr ${course.dishFocus.trim()} zu — mit Tipps zur Schärfe und Würzung.`
                    : "Schritt für Schritt bereitet ihr Klassiker wie Pad Thai oder Tom Yam zu — mit Tipps zur Schärfe und Würzung.",
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
          <div className="side-form-sticky">
            <ContactForm
              subject="Kochkurs Anfrage Landshut"
              title="Kursplatz anfragen"
              intro="Name, Personenanzahl und Wunschtermin reichen völlig."
              source="kochkurs"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
