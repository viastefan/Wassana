import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { LocationSection } from "@/components/LocationSection";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { fillTemplate, getSitePages } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anfahrt Thai Imbiss Landshut",
  description:
    "Anfahrt zu Wassana Thai Imbiss in Landshut: Regierungsplatz 542, zentral in der Altstadt. Route, Öffnungszeiten und Kontakt.",
  alternates: { canonical: "/anfahrt" },
  openGraph: {
    title: "Anfahrt | Wassana Thai Imbiss Landshut",
    description:
      "Regierungsplatz 542, 84028 Landshut — so findet ihr uns.",
    url: "/anfahrt",
  },
  robots: { index: true, follow: true },
};

export default async function AnfahrtPage() {
  const [business, content, pages] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
    getSitePages(),
  ]);
  const copy = pages.anfahrt;

  return (
    <>
      <ContentPage
        breadcrumbs={[
          { name: "Start", path: "/" },
          { name: "Anfahrt", path: "/anfahrt" },
        ]}
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={fillTemplate(copy.lead, {
          street: business.street,
          zip: business.zip,
          city: business.city,
        })}
        image="/images/hero.jpg"
        imageAlt="Wassana Thai Imbiss am Regierungsplatz in Landshut"
      >
        <ContentBlock title={copy.addressTitle}>
          <p className="text-[color:var(--ink)]">
            {business.fullName}
            <br />
            {business.street}
            <br />
            {business.zip} {business.city}
          </p>
          <p>
            {copy.phoneLabel}{" "}
            <a href={business.phoneHref} className="text-[color:var(--red)]">
              {business.phone}
            </a>
          </p>
        </ContentBlock>

        <ContentBlock title={copy.hoursTitle}>
          <p>
            {content.hours.weekdaysLong}. {content.hours.weekend}.
          </p>
        </ContentBlock>

        <ContentBlock title={copy.travelTitle}>
          <p>{copy.travelText}</p>
        </ContentBlock>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={business.maps.directions}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            {copy.ctaRoute}
          </a>
          <a href={business.phoneHref} className="btn-gold">
            {copy.ctaCall}
          </a>
          <Link href="/kontakt" className="btn-gold">
            {copy.ctaKontakt}
          </Link>
        </div>
      </ContentPage>

      <LocationSection location={content.location} hours={content.hours} />
    </>
  );
}
