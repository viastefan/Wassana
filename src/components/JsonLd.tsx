import type { ResolvedBusiness } from "@/lib/business-profile-shared";
import type { CookingCourseData } from "@/lib/cooking-course-shared";
import type { MenuSection } from "@/lib/menu";
import type { SeoFaqItem } from "@/lib/seo-faq";
import { getSiteUrl, site } from "@/lib/site";

function JsonScript({ data }: { data: Record<string, unknown> | object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function parseEuroPrice(price: string): string | null {
  const cleaned = String(price).replace(/\s/g, "");
  const withDec = cleaned.match(/(\d+)[,.](\d{1,2})/);
  if (withDec) {
    return `${withDec[1]}.${withDec[2].padEnd(2, "0")}`;
  }
  const whole = cleaned.match(/(\d+)(?:€|EUR|,-)?/i);
  if (!whole) return null;
  return `${whole[1]}.00`;
}

const MAIN_NAV = [
  { name: "Start", path: "/" },
  { name: "Speisekarte", path: "/speisekarte" },
  { name: "Mitnehmen", path: "/mitnehmen" },
  { name: "Catering", path: "/catering" },
  { name: "Kochkurs", path: "/kochkurs" },
  { name: "Schüler-Mittagessen", path: "/schueler-mittagessen" },
  { name: "Anfahrt", path: "/anfahrt" },
  { name: "Über uns", path: "/ueber-uns" },
  { name: "Kontakt", path: "/kontakt" },
] as const;

export function JsonLdLocalBusiness({
  business,
}: {
  business: ResolvedBusiness;
}) {
  const url = getSiteUrl();
  const sameAs = [business.facebook, business.instagram].filter(Boolean);

  const data = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
    "@id": `${url}/#business`,
    name: business.fullName,
    alternateName: [
      "Wassana Thai Imbiss",
      "Wassana Landshut",
      "Wassana Thai Imbiss Landshut",
      business.shortName,
    ],
    description:
      "Authentischer Thai Imbiss in Landshut am Regierungsplatz: Curries, Wok-Gerichte, Suppen, Catering und Kochkurse — frisch und zum Mitnehmen.",
    url,
    telephone: business.phoneE164,
    email: business.email,
    image: [
      `${url}/images/hero.jpg`,
      `${url}/images/curry.jpg`,
      `${url}/images/logo.png`,
    ],
    logo: {
      "@type": "ImageObject",
      url: `${url}/images/logo.png`,
      width: 512,
      height: 512,
    },
    slogan: "Glück und gutes Schicksal — frische Thai-Küche in Landshut",
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    servesCuisine: ["Thai", "Asian", "Southeast Asian"],
    acceptsReservations: false,
    takeout: true,
    delivery: false,
    publicAccess: true,
    smokingAllowed: false,
    hasMenu: `${url}/speisekarte`,
    menu: `${url}/speisekarte`,
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
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: [
      {
        "@type": "City",
        name: "Landshut",
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Niederbayern",
        },
      },
      { "@type": "AdministrativeArea", name: "Niederbayern" },
      { "@type": "AdministrativeArea", name: "Bayern" },
    ],
    containedInPlace: {
      "@type": "Place",
      name: "Regierungsplatz Landshut",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Landshut",
        postalCode: business.zip,
        addressRegion: "Bayern",
        addressCountry: "DE",
      },
    },
    knowsAbout: [
      "Thai Curry Landshut",
      "Thai Imbiss Regierungsplatz",
      "Thai Catering Landshut",
      "Thai Kochkurs Landshut",
      "Mittagessen zum Mitnehmen Landshut",
    ],
    founder: {
      "@type": "Person",
      name: business.owner,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: business.phoneE164,
        contactType: "customer service",
        areaServed: "DE",
        availableLanguage: ["German", "Thai"],
      },
    ],
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
        deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp",
      },
      {
        "@type": "ReserveAction",
        name: "Catering anfragen",
        target: `${url}/catering`,
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

  return <JsonScript data={data} />;
}

export function JsonLdWebSite({ business }: { business: ResolvedBusiness }) {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: business.shortName,
    alternateName: [
      business.fullName,
      "Wassana Thai Imbiss Landshut",
      "Wassana Landshut",
    ],
    description:
      "Thai Imbiss Wassana in Landshut — Speisekarte, Catering und Kochkurs. Mo–Fr frisch am Regierungsplatz.",
    inLanguage: "de-DE",
    publisher: { "@id": `${url}/#business` },
    about: { "@id": `${url}/#business` },
    copyrightHolder: { "@id": `${url}/#business` },
    hasPart: MAIN_NAV.map((item) => ({
      "@type": "WebPage",
      name: item.name,
      url: `${url}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return <JsonScript data={data} />;
}

/** Helps Google understand primary sitelinks under the brand result. */
export function JsonLdSiteNavigation() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}/#sitelinks`,
    name: "Wassana Hauptnavigation",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: MAIN_NAV.length,
    itemListElement: MAIN_NAV.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: `${url}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return <JsonScript data={data} />;
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

  return <JsonScript data={data} />;
}

export function JsonLdFaqPage({ items }: { items: SeoFaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonScript data={data} />;
}

export function JsonLdMenu({
  sections,
  businessName,
}: {
  sections: MenuSection[];
  businessName: string;
}) {
  const url = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}/speisekarte#menu`,
    name: `Speisekarte ${businessName}`,
    description:
      "Thai Speisekarte von Wassana in Landshut: Vorspeisen, Curries, Wok, Suppen, vegetarisch und Getränke.",
    url: `${url}/speisekarte`,
    inLanguage: "de-DE",
    hasMenuSection: sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      description: section.note || undefined,
      hasMenuItem: section.items.slice(0, 24).map((item) => {
        const label = item.nr ? `${item.nr}. ${item.name}` : item.name;
        const priceRaw = item.price || item.prices?.[0]?.price || "";
        const amount = parseEuroPrice(priceRaw);
        return {
          "@type": "MenuItem",
          name: label,
          description: item.description || undefined,
          offers: amount
            ? {
                "@type": "Offer",
                price: amount,
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
              }
            : undefined,
        };
      }),
    })),
    provider: { "@id": `${url}/#business` },
  };

  return <JsonScript data={data} />;
}

export function JsonLdCookingCourseEvent({
  course,
  business,
}: {
  course: CookingCourseData;
  business: ResolvedBusiness;
}) {
  if (!course.active || !course.date) return null;

  const url = getSiteUrl();
  const title = course.title?.trim() || "Thai Kochkurs Landshut";
  const startTime = course.startTime?.trim();
  const startDate =
    startTime && /^\d{1,2}:\d{2}$/.test(startTime)
      ? `${course.date}T${startTime.padStart(5, "0")}`
      : course.date;
  const priceAmount = course.price ? parseEuroPrice(course.price) : null;
  const maxSeats = Number.parseInt(String(course.maxParticipants || ""), 10);

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}/kochkurs#event-${course.date}`,
    name: title,
    description:
      course.teaser?.trim() ||
      course.pageText?.trim() ||
      "Thai Kochkurs bei Wassana in Landshut — Schritt für Schritt kochen lernen.",
    startDate,
    endDate: course.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [`${url}${course.image || "/images/ingredients.jpg"}`],
    url: `${url}/kochkurs`,
    inLanguage: "de-DE",
    ...(Number.isFinite(maxSeats) && maxSeats > 0
      ? { maximumAttendeeCapacity: maxSeats }
      : {}),
    location: {
      "@type": "Place",
      name: business.fullName,
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
      ...(course.locationNote?.trim()
        ? { description: course.locationNote.trim() }
        : {}),
    },
    organizer: {
      "@type": "Organization",
      name: business.fullName,
      url,
      telephone: business.phoneE164,
    },
    performer: {
      "@type": "Person",
      name: business.owner,
    },
    offers: {
      "@type": "Offer",
      url: `${url}/kochkurs`,
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().slice(0, 10),
      ...(priceAmount
        ? { price: priceAmount, priceCurrency: "EUR" }
        : course.price?.trim()
          ? { description: course.price.trim() }
          : {}),
    },
  };

  return <JsonScript data={data} />;
}
