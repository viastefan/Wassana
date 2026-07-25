import type { Metadata } from "next";
import Link from "next/link";
import { ContentBlock, ContentPage } from "@/components/ContentPage";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { fillTemplate, getSitePages } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Über uns – Wassana Thai Imbiss Landshut",
  description:
    "Über Wassana in Landshut: Bedeutung von Glück und gutem Schicksal, frische Thai-Küche am Regierungsplatz und unser Imbiss zum Mitnehmen.",
  alternates: { canonical: "/ueber-uns" },
  openGraph: {
    title: "Über Wassana | Thai Imbiss Landshut",
    description:
      "Glück und gutes Schicksal — authentische Thai-Küche am Regierungsplatz.",
    url: "/ueber-uns",
  },
  robots: { index: true, follow: true },
};

export default async function UeberUnsPage() {
  const [business, content, pages] = await Promise.all([
    getResolvedBusiness(),
    getSiteContent(),
    getSitePages(),
  ]);
  const copy = pages.ueberUns;

  return (
    <ContentPage
      breadcrumbs={[
        { name: "Start", path: "/" },
        { name: "Über uns", path: "/ueber-uns" },
      ]}
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      image="/images/ingredients.jpg"
      imageAlt="Frische Zutaten der Thai-Küche bei Wassana in Landshut"
    >
      <ContentBlock title={copy.meaningTitle}>
        <p className="text-[color:var(--ink)]">{content.meaning}</p>
      </ContentBlock>

      <ContentBlock title={copy.placeTitle}>
        <p>
          {fillTemplate(copy.placeP1, {
            fullName: business.fullName,
            street: business.street,
          })}
        </p>
        <p>
          {copy.placeP2Prefix}{" "}
          <strong className="text-[color:var(--ink)]">{business.owner}</strong>
        </p>
      </ContentBlock>

      <ContentBlock title={copy.hoursTitle}>
        <p>
          {content.hours.weekdaysLong}. {content.hours.weekend}.
        </p>
        <p>{copy.hoursP2}</p>
      </ContentBlock>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/speisekarte" className="btn-primary">
          {copy.ctaMenu}
        </Link>
        <Link href="/kontakt" className="btn-gold">
          {copy.ctaKontakt}
        </Link>
      </div>
    </ContentPage>
  );
}
