import { site } from "@/lib/site";
import { sanitizeText } from "@/lib/security";

export type TopBanner = {
  active: boolean;
  text: string;
  highlight: string;
  linkHref: string;
  linkLabel: string;
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

export function defaultTopBanner(): TopBanner {
  return {
    active: true,
    text: "Schüler & Azubis mittags: Gericht inkl. Getränk",
    highlight: site.studentLunch.price,
    linkHref: STUDENT_LUNCH_POPUP_HREF,
    linkLabel: "Mehr",
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
      "Mo–Fr mittags gibt’s ein Gericht der aktuellen Wochenkarte plus Softgetränk. Ideal zum Mitnehmen oder vor Ort abholen.",
    popupBullets:
      "Gericht der Wochenkarte\nSoftgetränk inklusive\nFür Schülerinnen, Schüler und Azubis\nGegen Vorlage vom Ausweis",
    popupPrice: site.studentLunch.price,
    popupNote: site.studentLunch.note,
    popupCtaLabel: "Zur Wochenkarte",
    popupCtaHref: "/speisekarte#wochenkarte",
  };
}
