/**
 * Mandant-Daten für die Inhaber-App unter /admin.
 */
export type CmsModuleId = "menu" | "offers" | "inbox" | "settings";

export const cmsProduct = {
  name: "Wassana",
  vendor: "",
  tagline: "Speisekarte und Angebote live ändern.",
} as const;

export const cmsSite = {
  id: "wassana",
  name: "Wassana Thai Imbiss",
  city: "Landshut",
  publicUrl: "https://www.wassana-thai-imbiss.de",
  accent: "#7a0c24",
  logoSrc: "/images/logo.png",
  modules: ["menu", "offers", "inbox", "settings"] as const satisfies readonly CmsModuleId[],
  /** Used to deep-link the owner into the right hosting screens during setup. */
  hosting: {
    team: "festag",
    project: "wassana",
  },
} as const;

export const cmsHostingUrls = {
  stores: `https://vercel.com/${cmsSite.hosting.team}/${cmsSite.hosting.project}/stores`,
  deployments: `https://vercel.com/${cmsSite.hosting.team}/${cmsSite.hosting.project}/deployments`,
} as const;

export const cmsModuleMeta: Record<
  CmsModuleId,
  {
    tab: "menu" | "banner" | "inbox" | "settings";
    label: string;
    title: string;
    hint: string;
  }
> = {
  menu: {
    tab: "menu",
    label: "Karte",
    title: "Speisekarte",
    hint: "Gerichte und Preise live",
  },
  offers: {
    tab: "banner",
    label: "Angebot",
    title: "Angebote",
    hint: "Banner und Mittag",
  },
  inbox: {
    tab: "inbox",
    label: "Post",
    title: "Anfragen",
    hint: "Kontakt, Catering, Kurs",
  },
  settings: {
    tab: "settings",
    label: "Mehr",
    title: "Betrieb",
    hint: "Öffnungszeiten, Adresse, Zugang",
  },
};
