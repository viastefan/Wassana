import path from "path";
import { site } from "@/lib/site";
import {
  readJsonFile,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
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
  studentLunch: {
    eyebrow: string;
    title: string;
    text: string;
    price: string;
    note: string;
  };
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

const DATA_PATH = path.join(process.cwd(), "data", "site-content.json");
const TMP_PATH = path.join("/tmp", "wassana-site-content.json");

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeColor(value: string, fallback: string): string {
  const next = String(value || "").trim();
  return HEX.test(next) ? next.toLowerCase() : fallback;
}

function sanitizeHref(value: string, fallback: string): string {
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
    linkHref: "/speisekarte#wochenkarte",
    linkLabel: "Mehr",
    backgroundColor: "#7a0c24",
    textColor: "#f7f3ea",
    highlightColor: "#cbb892",
  };
}

export function defaultSiteContent(): SiteContent {
  return {
    hero: {
      eyebrow: "Willkommen bei",
      lede: "Frisch gekocht am Regierungsplatz — Curry, Wok und Mitnehmen.",
    },
    meaning: site.meaning,
    hours: {
      weekdays: site.hours.weekdays,
      weekdaysLong: site.hours.weekdaysLong,
      weekend: site.hours.weekend,
    },
    studentLunch: { ...site.studentLunch },
    topBanner: defaultTopBanner(),
    location: {
      eyebrow: "Hier findest du uns",
      title: "Regierungsplatz, Landshut",
      text: "Im Gewerbehaus am Regierungsplatz — frisch kochen, abholen, genießen.",
    },
    closing: {
      title: "Bis bald bei Wassana",
      text: "",
    },
    updatedAt: new Date().toISOString(),
  };
}

function normalize(raw: Partial<SiteContent> | null): SiteContent {
  const base = defaultSiteContent();
  if (!raw) return base;
  const bannerRaw = raw.topBanner || ({} as Partial<TopBanner>);
  return {
    hero: {
      eyebrow: sanitizeText(
        String(raw.hero?.eyebrow ?? base.hero.eyebrow),
        120,
      ),
      lede: sanitizeText(String(raw.hero?.lede ?? base.hero.lede), 400),
    },
    meaning: sanitizeText(String(raw.meaning ?? base.meaning), 1200),
    hours: {
      weekdays: sanitizeText(
        String(raw.hours?.weekdays ?? base.hours.weekdays),
        120,
      ),
      weekdaysLong: sanitizeText(
        String(raw.hours?.weekdaysLong ?? base.hours.weekdaysLong),
        200,
      ),
      weekend: sanitizeText(
        String(raw.hours?.weekend ?? base.hours.weekend),
        200,
      ),
    },
    studentLunch: {
      eyebrow: sanitizeText(
        String(raw.studentLunch?.eyebrow ?? base.studentLunch.eyebrow),
        120,
      ),
      title: sanitizeText(
        String(raw.studentLunch?.title ?? base.studentLunch.title),
        160,
      ),
      text: sanitizeText(
        String(raw.studentLunch?.text ?? base.studentLunch.text),
        800,
      ),
      price: sanitizeText(
        String(raw.studentLunch?.price ?? base.studentLunch.price),
        40,
      ),
      note: sanitizeText(
        String(raw.studentLunch?.note ?? base.studentLunch.note),
        240,
      ),
    },
    topBanner: {
      active:
        typeof bannerRaw.active === "boolean"
          ? bannerRaw.active
          : base.topBanner.active,
      text: sanitizeText(
        String(bannerRaw.text ?? base.topBanner.text),
        180,
      ),
      highlight: sanitizeText(
        String(bannerRaw.highlight ?? base.topBanner.highlight),
        60,
      ),
      linkHref: sanitizeHref(
        String(bannerRaw.linkHref ?? base.topBanner.linkHref),
        base.topBanner.linkHref,
      ),
      linkLabel: sanitizeText(
        String(bannerRaw.linkLabel ?? base.topBanner.linkLabel),
        40,
      ),
      backgroundColor: sanitizeColor(
        String(bannerRaw.backgroundColor ?? base.topBanner.backgroundColor),
        base.topBanner.backgroundColor,
      ),
      textColor: sanitizeColor(
        String(bannerRaw.textColor ?? base.topBanner.textColor),
        base.topBanner.textColor,
      ),
      highlightColor: sanitizeColor(
        String(bannerRaw.highlightColor ?? base.topBanner.highlightColor),
        base.topBanner.highlightColor,
      ),
    },
    location: {
      eyebrow: sanitizeText(
        String(raw.location?.eyebrow ?? base.location.eyebrow),
        120,
      ),
      title: sanitizeText(
        String(raw.location?.title ?? base.location.title),
        160,
      ),
      text: sanitizeText(
        String(raw.location?.text ?? base.location.text),
        600,
      ),
    },
    closing: {
      title: sanitizeText(
        String(raw.closing?.title ?? base.closing.title),
        160,
      ),
      text: sanitizeText(
        String(raw.closing?.text ?? base.closing.text),
        600,
      ),
    },
    updatedAt: String(raw.updatedAt ?? base.updatedAt),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const fromTmp = await readJsonFile<Partial<SiteContent>>(TMP_PATH);
  if (fromTmp) return normalize(fromTmp);
  const fromData = await readJsonFile<Partial<SiteContent>>(DATA_PATH);
  if (fromData) return normalize(fromData);
  return defaultSiteContent();
}

export async function saveSiteContent(
  input: Omit<SiteContent, "updatedAt">,
): Promise<{ content: SiteContent; persist: PersistResult }> {
  const next = normalize({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/site-content.json",
    "chore: update site content from admin",
  );
  if (!persist.tmp && !persist.disk && !persist.github) {
    throw new Error(persist.error || "Inhalte konnten nicht gespeichert werden.");
  }
  return { content: next, persist };
}
