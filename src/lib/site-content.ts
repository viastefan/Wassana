import path from "path";
import { site } from "@/lib/site";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";
import {
  defaultStudentLunch,
  defaultTopBanner,
  sanitizeColor,
  sanitizeHref,
  type SiteContent,
  type TopBanner,
} from "@/lib/site-content-shared";

export type {
  SiteContent,
  StudentLunchOffer,
  TopBanner,
} from "@/lib/site-content-shared";
export {
  STUDENT_LUNCH_POPUP_HREF,
  defaultStudentLunch,
  defaultTopBanner,
  isStudentLunchPopupHref,
} from "@/lib/site-content-shared";

const DATA_PATH = path.join(process.cwd(), "data", "site-content.json");
const TMP_PATH = path.join("/tmp", "wassana-site-content.json");

export function defaultSiteContent(): SiteContent {
  return {
    hero: {
      eyebrow: "Thai Imbiss und Feinkost · Landshut",
      lede: "Frisch gekocht am Regierungsplatz — Curry, Wok und Mitnehmen.",
    },
    meaning: site.meaning,
    hours: {
      weekdays: site.hours.weekdays,
      weekdaysLong: site.hours.weekdaysLong,
      weekend: site.hours.weekend,
    },
    studentLunch: defaultStudentLunch(),
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
      popupTitle: sanitizeText(
        String(
          raw.studentLunch?.popupTitle ??
            raw.studentLunch?.title ??
            base.studentLunch.popupTitle,
        ),
        160,
      ),
      popupLead: sanitizeText(
        String(
          raw.studentLunch?.popupLead ??
            raw.studentLunch?.text ??
            base.studentLunch.popupLead,
        ),
        400,
      ),
      popupBody: sanitizeText(
        String(raw.studentLunch?.popupBody ?? base.studentLunch.popupBody),
        1200,
      ),
      popupBullets: sanitizeText(
        String(
          raw.studentLunch?.popupBullets ?? base.studentLunch.popupBullets,
        ),
        800,
      ),
      popupPrice: sanitizeText(
        String(
          raw.studentLunch?.popupPrice ??
            raw.studentLunch?.price ??
            base.studentLunch.popupPrice,
        ),
        40,
      ),
      popupNote: sanitizeText(
        String(
          raw.studentLunch?.popupNote ??
            raw.studentLunch?.note ??
            base.studentLunch.popupNote,
        ),
        240,
      ),
      popupCtaLabel: sanitizeText(
        String(
          raw.studentLunch?.popupCtaLabel ?? base.studentLunch.popupCtaLabel,
        ),
        60,
      ),
      popupCtaHref: sanitizeHref(
        String(
          raw.studentLunch?.popupCtaHref ?? base.studentLunch.popupCtaHref,
        ),
        base.studentLunch.popupCtaHref,
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
      suffix: sanitizeText(
        String(bannerRaw.suffix ?? base.topBanner.suffix),
        120,
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
  const raw = await readJsonWithFallback<Partial<SiteContent>>(
    DATA_PATH,
    TMP_PATH,
    "data/site-content.json",
  );
  if (raw) return normalize(raw);
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
  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Inhalte konnten nicht gespeichert werden.");
  }
  return { content: next, persist };
}
