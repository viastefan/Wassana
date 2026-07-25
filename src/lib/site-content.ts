import path from "path";
import { site } from "@/lib/site";
import { readJsonFile, writeJsonWithFallback } from "@/lib/persist-json";

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

export function defaultSiteContent(): SiteContent {
  return {
    hero: {
      eyebrow: "Thai Imbiss · Landshut",
      lede: "Frisch gekocht am Regierungsplatz — Curry, Wok und Mitnehmen.",
    },
    meaning: site.meaning,
    hours: {
      weekdays: site.hours.weekdays,
      weekdaysLong: site.hours.weekdaysLong,
      weekend: site.hours.weekend,
    },
    studentLunch: { ...site.studentLunch },
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
  return {
    hero: {
      eyebrow: String(raw.hero?.eyebrow ?? base.hero.eyebrow),
      lede: String(raw.hero?.lede ?? base.hero.lede),
    },
    meaning: String(raw.meaning ?? base.meaning),
    hours: {
      weekdays: String(raw.hours?.weekdays ?? base.hours.weekdays),
      weekdaysLong: String(raw.hours?.weekdaysLong ?? base.hours.weekdaysLong),
      weekend: String(raw.hours?.weekend ?? base.hours.weekend),
    },
    studentLunch: {
      eyebrow: String(raw.studentLunch?.eyebrow ?? base.studentLunch.eyebrow),
      title: String(raw.studentLunch?.title ?? base.studentLunch.title),
      text: String(raw.studentLunch?.text ?? base.studentLunch.text),
      price: String(raw.studentLunch?.price ?? base.studentLunch.price),
      note: String(raw.studentLunch?.note ?? base.studentLunch.note),
    },
    location: {
      eyebrow: String(raw.location?.eyebrow ?? base.location.eyebrow),
      title: String(raw.location?.title ?? base.location.title),
      text: String(raw.location?.text ?? base.location.text),
    },
    closing: {
      title: String(raw.closing?.title ?? base.closing.title),
      text: String(raw.closing?.text ?? base.closing.text),
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
): Promise<SiteContent> {
  const next = normalize({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/site-content.json",
    "chore: update site content from admin",
  );
  return next;
}
