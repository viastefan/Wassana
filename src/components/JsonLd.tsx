import { getSiteUrl, site } from "@/lib/site";

export function JsonLdLocalBusiness() {
  const url = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
    "@id": `${url}/#business`,
    name: site.fullName,
    alternateName: ["Wassana Thai Imbiss", "Wassana Landshut", site.shortName],
    description:
      "Authentischer Thai Imbiss in Landshut am Regierungsplatz: Curries, Wok-Gerichte, Suppen, Catering und Kochkurse — frisch und zum Mitnehmen.",
    url,
    telephone: site.phoneE164,
    email: site.email,
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
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.zip,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: site.maps.place,
    openingHoursSpecification: site.hours.schema.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [site.social.facebook, site.social.instagram],
    areaServed: [
      { "@type": "City", name: "Landshut" },
      { "@type": "AdministrativeArea", name: "Niederbayern" },
    ],
    founder: {
      "@type": "Person",
      name: site.owner,
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

export function JsonLdWebSite() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: site.shortName,
    alternateName: site.fullName,
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
      item: `${url}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
