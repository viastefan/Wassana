import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { fillTemplate, getSitePages } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thai Essen mitnehmen Landshut",
  description:
    "Thai Essen in Landshut mitnehmen: frisch gekocht am Regierungsplatz, Mo–Fr Abholen. Curries, Wok und beliebte Gerichte der Woche zum Mitnehmen.",
  alternates: { canonical: "/mitnehmen" },
  openGraph: {
    title: "Thai Essen mitnehmen | Wassana Landshut",
    description:
      "Frisch abholen am Regierungsplatz — Curries, Wok und mehr zum Mitnehmen.",
    url: "/mitnehmen",
  },
  robots: { index: true, follow: true },
};

export default async function MitnehmenPage() {
  const [business, content, pages] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
    getSitePages(),
  ]);
  const copy = pages.mitnehmen;
  const vars = {
    phone: business.phone,
    street: business.street,
    zip: business.zip,
    city: business.city,
  };

  return (
    <ContentPage
      breadcrumbs={[
        { name: "Start", path: "/" },
        { name: "Mitnehmen", path: "/mitnehmen" },
      ]}
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      image="/images/soup.jpg"
      imageAlt="Thai-Gericht zum Mitnehmen bei Wassana in Landshut"
    >
      <ContentBlock title={copy.block1Title}>
        <p>{fillTemplate(copy.block1P1, vars)}</p>
        <p>{fillTemplate(copy.block1P2, vars)}</p>
      </ContentBlock>

      <ContentBlock title={copy.block2Title}>
        <p>
          {content.hours.weekdaysLong}. {content.hours.weekend}.
        </p>
        <p>{copy.block2P2}</p>
      </ContentBlock>

      <ContentBlock title={copy.block3Title}>
        <p>{copy.block3P1}</p>
      </ContentBlock>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/speisekarte" className="btn-primary">
          {copy.ctaMenu}
        </Link>
        <a href={business.phoneHref} className="btn-gold">
          {business.phone}
        </a>
        <Link href="/anfahrt" className="btn-gold">
          {copy.ctaAnfahrt}
        </Link>
      </div>
    </ContentPage>
  );
}
