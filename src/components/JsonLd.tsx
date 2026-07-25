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
    image: [`${url}/images/logo.jpg`, `${url}/images/hero.jpg`],
    logo: `${url}/images/logo.jpg`,
    priceRange: "€",
    servesCuisine: ["Thai", "Asian"],
    acceptsReservations: false,
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
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${site.fullName} ${site.address.street} ${site.address.zip} ${site.address.city}`
    )}`,
    openingHoursSpecification: site.hours.schema.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [site.social.facebook, site.social.instagram],
    areaServed: {
      "@type": "City",
      name: "Landshut",
    },
    founder: {
      "@type": "Person",
      name: site.owner,
    },
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
    description:
      "Thai Imbiss Wassana in Landshut — Speisekarte, Catering und Kochkurs.",
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
