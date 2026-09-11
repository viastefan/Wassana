/**
 * Reusable website-manager product.
 * Next client: copy this file, change `cmsSite`, keep `cmsProduct`.
 * Modules you don't need: drop them from `modules`.
 */
export type CmsModuleId = "menu" | "offers" | "inbox" | "settings";

export const cmsProduct = {
  name: "Site Manager",
  vendor: "viawen",
  tagline: "Website steuern — Speisekarte, Angebote, Anfragen.",
} as const;

export const cmsSite = {
  id: "wassana",
  name: "Wassana Thai Imbiss",
  city: "Landshut",
  publicUrl: "https://www.wassana-thai-imbiss.de",
  accent: "#7a0c24",
  logoSrc: "/images/logo.png",
  modules: ["menu", "offers", "inbox", "settings"] as const satisfies readonly CmsModuleId[],
} as const;

export const cmsModuleMeta: Record<
  CmsModuleId,
  { tab: "menu" | "banner" | "inbox" | "settings"; label: string; hint: string }
> = {
  menu: {
    tab: "menu",
    label: "Speisekarte",
    hint: "Gerichte und Preise live",
  },
  offers: {
    tab: "banner",
    label: "Angebote",
    hint: "Banner und Mittag",
  },
  inbox: {
    tab: "inbox",
    label: "Anfragen",
    hint: "Kontakt, Catering, Kurs",
  },
  settings: {
    tab: "settings",
    label: "Betrieb",
    hint: "Adresse, Status, Zugang",
  },
};
