import type { ResolvedBusiness } from "@/lib/business-profile-shared";
import { getSiteUrl, site } from "@/lib/site";

export function JsonLdLocalBusiness({
  business,
}: {
  business: ResolvedBusiness;
}) {
  const url = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
    "@id": `${url}/#business`,
    name: business.fullName,
    alternateName: ["Wassana Thai Imbiss", "Wassana Landshut", business.shortName],
    description:
      "Authentischer Thai Imbiss in Landshut am Regierungsplatz: Curries, Wok-Gerichte, Suppen, Catering und Kochkurse — frisch und zum Mitnehmen.",
    url,
    telephone: business.phoneE164,
    email: business.email,
    image: [`${url}/images/hero.jpg`, `${url}/images/curry.jpg`, `${url}/images/logo.png`],
    logo: `${url}/images/logo.png`,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    servesCuisine: ["Thai", "Asian"],
    acceptsReservations: false,
    takeout: true,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.street,
      addressLocality: business.city,
      postalCode: business.zip,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: business.maps.place,
    openingHoursSpecification: site.hours.schema.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [business.facebook, business.instagram],
    areaServed: [
      { "@type": "City", name: business.city },
      { "@type": "AdministrativeArea", name: "Niederbayern" },
    ],
    founder: {
      "@type": "Person",
      name: business.owner,
    },
    potentialAction: [
      {
        "@type": "OrderAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/speisekarte`,
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
      },
      {
        "@type": "CommunicateAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/kontakt`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLdWebSite({ business }: { business: ResolvedBusiness }) {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: business.shortName,
    alternateName: business.fullName,
    description:
      "Thai Imbiss Wassana in Landshut — Speisekarte, Catering und Kochkurs. Mo–Fr frisch am Regierungsplatz.",
    inLanguage: "de-DE",
    publisher: { "@id": `${url}/#business` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLdBreadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${url}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
