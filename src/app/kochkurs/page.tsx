import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { MediaBand, SplitMedia } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import {
  formatCourseDate,
  getCookingCourse,
  isPublicPromoVisible,
} from "@/lib/cooking-course";
import { site } from "@/lib/site";

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
};

export const dynamic = "force-dynamic";

export default async function KochkursPage() {
  const course = await getCookingCourse();
  const showNext = isPublicPromoVisible(course);

  return (
    <main>
      <MediaBand
        src="/images/ingredients.jpg"
        alt="Frische Zutaten für den Thai Kochkurs bei Wassana"
        eyebrow="Kochkurs Landshut"
        title="Thai-Küche näher kennenlernen"
        text="Schritt für Schritt Pad Thai oder Tom Yam — inkl. Tipps, wo Sie die Zutaten finden."
        priority
        height="short"
      />

      {showNext ? (
        <div className="border-b border-[color:var(--line)] bg-[color:var(--paper)]">
          <div className="mx-auto max-w-6xl px-5 py-6 md:px-8">
            <p className="text-[color:var(--ink)]">
              Nächster Termin:{" "}
              <strong className="text-[color:var(--red)]">
                {formatCourseDate(course.date)}
              </strong>
              {course.teaser ? ` — ${course.teaser}` : null}
            </p>
          </div>
        </div>
      ) : null}

      <SplitMedia
        src="/images/soup.jpg"
        alt="Gericht aus dem Kochkurs"
        imageRight
      >
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            So läuft es
          </p>
          <div className="mt-6 space-y-6">
            {[
              { label: "Ablauf", value: "Schritt für Schritt gemeinsam kochen" },
              { label: "Gerichte", value: "z. B. Pad Thai oder Tom Yam" },
              {
                label: "Extra",
                value: "Tipps, wo Sie die Zutaten finden",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border-t border-[color:var(--line)] pt-5"
              >
                <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                  {item.label}
                </p>
                <p className="mt-2 text-lg text-[color:var(--ink)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.cookingEmailHref} className="btn-primary">
              Per E-Mail anfragen
            </a>
            <a href={site.phoneHref} className="btn-gold">
              Anrufen
            </a>
          </div>
        </Reveal>
      </SplitMedia>

      <section className="bg-[color:var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              Platz sichern
            </p>
            <h2 className="font-display mt-3 text-3xl text-[color:var(--ink)]">
              Kursplatz anfragen
            </h2>
            <p className="mt-4 leading-relaxed text-[color:var(--muted)]">
              Name, Personenanzahl und Wunschtermin reichen. Auch über das{" "}
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
              to={site.cookingEmail}
              subject="Kochkurs Anfrage Landshut"
              title="Kursplatz anfragen"
              intro="Name, Personenanzahl und Wunschtermin reichen völlig."
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
