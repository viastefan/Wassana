import { site } from "@/lib/site";
import { sanitizeText } from "@/lib/security";

export type TopBanner = {
  active: boolean;
  text: string;
  highlight: string;
  linkHref: string;
  linkLabel: string;
  /** Optional text after the link, e.g. ". Wo? In Landshut …" */
  suffix: string;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
};

export type StudentLunchOffer = {
  eyebrow: string;
  title: string;
  text: string;
  price: string;
  note: string;
  popupTitle: string;
  popupLead: string;
  popupBody: string;
  popupBullets: string;
  popupPrice: string;
  popupNote: string;
  popupCtaLabel: string;
  popupCtaHref: string;
};

export type SiteImageKey =
  | "hero"
  | "speisekarte"
  | "catering"
  | "kochkurs"
  | "location"
  | "shopFront"
  | "shopInterior"
  | "takeaway"
  | "offerSpeisekarte";

export type SiteImages = Record<SiteImageKey, string>;

export const DEFAULT_SITE_IMAGES: SiteImages = {
  hero: "/images/hero.jpg",
  speisekarte: "/images/page-speisekarte.jpg",
  catering: "/images/page-catering.jpg",
  kochkurs: "/images/page-kochkurs.jpg",
  location: "/images/location-wix.jpg",
  shopFront: "/images/shop-front.jpg",
  shopInterior: "/images/shop-interior.jpg",
  takeaway: "/images/thai-feast.jpg",
  offerSpeisekarte: "/images/offer-speisekarte-real.jpg",
};

export const SITE_IMAGE_FIELDS: {
  key: SiteImageKey;
  label: string;
  hint: string;
}[] = [
  { key: "hero", label: "Startseite Hero", hint: "Großes Bild oben auf der Startseite" },
  { key: "speisekarte", label: "Speisekarte", hint: "Kopfbild der Speisekarte" },
  { key: "catering", label: "Catering", hint: "Kopfbild Catering" },
  { key: "kochkurs", label: "Kochkurs", hint: "Kopfbild Kochkurs (wenn kein Kursbild gewählt)" },
  { key: "location", label: "Standort", hint: "Foto am Standort-Block" },
  { key: "shopFront", label: "Ladenfront", hint: "Über uns / Außenansicht" },
  { key: "shopInterior", label: "Innenraum", hint: "Anfahrt / Innenraum" },
  { key: "takeaway", label: "Mitnehmen", hint: "Seite Mitnehmen" },
  {
    key: "offerSpeisekarte",
    label: "Kachel Speisekarte",
    hint: "Kleine Kachel auf der Startseite",
  },
];

export function defaultSiteImages(): SiteImages {
  return { ...DEFAULT_SITE_IMAGES };
}

export function sanitizeImageSrc(value: string, fallback: string): string {
  const next = String(value || "").trim();
  if (!next) return fallback;
  if (next.startsWith("/images/") && !next.includes("..")) {
    return next.slice(0, 300);
  }
  try {
    const url = new URL(next);
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com")
    ) {
      return url.toString().slice(0, 500);
    }
  } catch {
    // ignore
  }
  return fallback;
}

export function isRemoteCmsSrc(src: string) {
  return /^https?:\/\//i.test(src);
}

export type SiteContent = {
  hero: {
    eyebrow: string;
    lede: string;
  };
  meaning: string;
  hours: {
    weekdays: string;
    weekdaysLong: string;
    weekend: string;
  };
  studentLunch: StudentLunchOffer;
  topBanner: TopBanner;
  location: {
    eyebrow: string;
    title: string;
    text: string;
  };
  closing: {
    title: string;
    text: string;
  };
  images: SiteImages;
  updatedAt: string;
};

/** Hash / href that opens the Schüler-Mittag popup instead of navigating. */
export const STUDENT_LUNCH_POPUP_HREF = "#mittag";

export function isStudentLunchPopupHref(href: string): boolean {
  const next = String(href || "").trim().toLowerCase();
  return (
    next === "#mittag" ||
    next === "#schueler-mittag" ||
    next === "popup:mittag" ||
    next === "popup"
  );
}

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function sanitizeColor(value: string, fallback: string): string {
  const next = String(value || "").trim();
  return HEX.test(next) ? next.toLowerCase() : fallback;
}

export function sanitizeHref(value: string, fallback: string): string {
  const next = sanitizeText(String(value || ""), 200);
  if (!next) return fallback;
  if (next.startsWith("/") || next.startsWith("#")) return next;
  if (/^https?:\/\//i.test(next)) return next;
  return fallback;
}

/** Strip redundant "in Landshut" after Schüler & Azubis (location stays in suffix). */
export function sanitizeTopBannerText(text: string): string {
  return text.replace(/Schüler & Azubis in Landshut/i, "Schüler & Azubis");
}

export function defaultTopBanner(): TopBanner {
  return {
    active: true,
    text: "Schüler & Azubis: mittags Gericht inkl. Getränk",
    highlight: site.studentLunch.price,
    linkHref: STUDENT_LUNCH_POPUP_HREF,
    linkLabel: "Mehr",
    suffix: ". Wo? In Landshut am Regierungsplatz",
    backgroundColor: "#7a0c24",
    textColor: "#f7f3ea",
    highlightColor: "#cbb892",
  };
}

export function defaultStudentLunch(): StudentLunchOffer {
  return {
    ...site.studentLunch,
    popupTitle: "Mittag für Schüler & Azubis",
    popupLead: "Gericht inkl. Getränk — mittags bei Wassana.",
    popupBody:
      "Mo–Fr mittags gibt’s ein Gericht der beliebten Gerichte der Woche plus Softgetränk. Ideal zum Mitnehmen oder vor Ort abholen.",
    popupBullets:
      "Gericht der Woche\nSoftgetränk inklusive\nFür Schülerinnen, Schüler und Azubis\nGegen Vorlage vom Ausweis",
    popupPrice: site.studentLunch.price,
    popupNote: site.studentLunch.note,
    popupCtaLabel: "Beliebte Gerichte",
    popupCtaHref: "/speisekarte#wochenkarte",
  };
}
