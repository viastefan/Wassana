export const site = {
  name: "Wassana",
  fullName: "Wassanas Thai Imbiss und Feinkost",
  shortName: "Wassana Thai Imbiss Landshut",
  tagline: "Thai Imbiss",
  meaning:
    "Das Wort Wassana bedeutet Glück und gutes Schicksal. Außerdem verbindet man mit diesem Wort auch Frische, Neubeginn und Wohlstand.",
  owner: "Pramot Yotkhrongmueang",
  address: {
    street: "Regierungsplatz 542",
    zip: "84028",
    city: "Landshut",
    region: "Bayern",
    country: "DE",
  },
  geo: {
    latitude: 48.53696305,
    longitude: 12.15558216,
  },
  phone: "0871/9745862",
  phoneHref: "tel:+498719745862",
  phoneE164: "+498719745862",
  email: "wassanathaiimbiss@icloud.de",
  emailHref: "mailto:wassanathaiimbiss@icloud.de",
  cookingEmail: "wassanathaiimbiss@icloud.de",
  cookingEmailHref:
    "mailto:wassanathaiimbiss@icloud.de?subject=Kochkurs%20Anfrage",
  cateringEmailHref:
    "mailto:wassanathaiimbiss@icloud.de?subject=Catering%20Anfrage",
  hours: {
    weekdays: "Mo–Fr 11:00–18:00",
    weekdaysLong: "Montag bis Freitag von 11:00–18:00 Uhr",
    weekend: "Sa, So & Feiertage geschlossen",
    schema: [
      {
        days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ] as const,
        opens: "11:00",
        closes: "18:00",
      },
    ],
  },
  social: {
    facebook:
      "https://www.facebook.com/pages/Wassanas-Thai-Imbiss-Feinkost/156423611044359",
    instagram: "https://www.instagram.com/wassanathaiimbiss/",
    instagramHandle: "@wassanathaiimbiss",
  },
  maps: {
    query:
      "Wassanas Thai Imbiss und Feinkost, Regierungsplatz 542, 84028 Landshut",
    embed: `https://www.google.com/maps?q=${encodeURIComponent(
      "Wassanas Thai Imbiss und Feinkost, Regierungsplatz 542, 84028 Landshut"
    )}&hl=de&z=16&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      "Regierungsplatz 542, 84028 Landshut"
    )}`,
    place: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      "Wassanas Thai Imbiss und Feinkost, Regierungsplatz 542, 84028 Landshut"
    )}`,
  },
  seo: {
    locale: "de_DE",
    keywords: [
      "Thai Imbiss Landshut",
      "Thai Restaurant Landshut",
      "Thai Essen Landshut",
      "Wassana Landshut",
      "Thai Curry Landshut",
      "Thai Catering Landshut",
      "Thai Kochkurs Landshut",
      "Mitnehmen Thai Landshut",
      "Regierungsplatz Thai Imbiss",
    ],
  },
} as const;

/** Canonical site origin — set NEXT_PUBLIC_SITE_URL in Vercel for production. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://www.wassana-thai-imbiss.de";
}

export const navLinks = [
  { href: "/", label: "Start" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/catering", label: "Catering" },
  { href: "/kochkurs", label: "Kochkurs" },
] as const;
