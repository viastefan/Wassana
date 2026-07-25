import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { getResolvedBusiness } from "@/lib/business-profile";

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

const offerings = [
  {
    title: "Individueller Menüplan",
    text: "Wir stellen Curries, Wok-Gerichte und Beilagen passend zu Anlass, Gästezahl und Vorlieben zusammen — auch vegetarisch möglich.",
  },
  {
    title: "Frisch zubereitet",
    text: "Die Gerichte kommen frisch aus unserer Küche am Regierungsplatz — authentisch gewürzt, zum Buffet oder zum Portionieren.",
  },
  {
    title: "Passendes Geschirr",
    text: "Auf Wunsch liefern wir Geschirr und Servierbedarf mit, damit bei dir vor Ort weniger Organisation nötig ist.",
  },
  {
    title: "Geburtstage & private Feiern",
    text: "Vom kleinen Familienessen bis zur größeren Feier — wir stimmen Menge und Menü vorher klar mit dir ab.",
  },
  {
    title: "Firmenfeiern & Meetings",
    text: "Für Teams und Kundentermine in Landshut: zuverlässig, zeitlich planbar und mit klarer Absprache zu Lieferung oder Abholung.",
  },
  {
    title: "Hochzeiten & besondere Anlässe",
    text: "Thai-Küche als besonderer Akzent — wir planen Vorlauf, Mengen und Ablauf gemeinsam mit euch.",
  },
] as const;

export default async function CateringPage() {
  const business = await getResolvedBusiness();

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
        eyebrow="Catering Landshut"
        title="Feierlichkeiten mit Thai-Atmosphäre"
        text="Geburtstage, Firmenfeiern oder Hochzeiten — individueller Menüplan und passendes Geschirr."
        priority
        height="short"
      />

      <section className="offer-strip">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-[var(--section-y)] md:grid-cols-2 md:items-start md:gap-16 md:px-8">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
              Unser Service
            </p>
            <h2 className="font-display mt-3 text-3xl text-[color:var(--ink)] md:text-4xl">
              Was wir übernehmen
            </h2>
            <p className="mt-4 max-w-md text-[color:var(--muted)] leading-relaxed">
              Du sagst uns Anlass, Personenzahl und Termin — wir kümmern uns um
              Menü, Mengen und die praktische Umsetzung.
            </p>

            <ul className="mt-9 space-y-6">
              {offerings.map((item, index) => (
                <li key={item.title} className="flex gap-4">
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
                Per E-Mail anfragen
              </a>
              <a href={business.phoneHref} className="btn-gold">
                Anrufen
              </a>
            </div>
            <p className="mt-6 text-sm text-[color:var(--muted)]">
              Oder nutze das Formular hier — oder unser{" "}
              <Link
                href="/kontakt"
                className="text-[color:var(--red)] underline-offset-2 hover:underline"
              >
                Kontaktformular
              </Link>
              .
            </p>
          </Reveal>
          <div className="side-form-sticky">
            <ContactForm
              subject="Catering Anfrage Landshut"
              title="Catering anfragen"
              intro="Kurz Anlass, Personenzahl und Wunschtermin — wir melden uns."
              source="catering"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
