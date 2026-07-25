import type { SiteContent } from "@/lib/site-content-shared";

export const CONTENT_FIELD_META: Record<
  string,
  { label: string; multiline?: boolean; hint?: string; group?: string }
> = {
  "hero.eyebrow": { label: "Hero — Begrüßung oben", group: "Startseite" },
  "hero.lede": {
    label: "Hero — Text unter der Überschrift",
    multiline: true,
    group: "Startseite",
  },
  meaning: {
    label: "Bedeutung „Wassana“",
    multiline: true,
    group: "Startseite",
  },
  "hours.weekdays": { label: "Öffnungszeiten kurz", group: "Zeiten" },
  "hours.weekdaysLong": { label: "Öffnungszeiten lang", group: "Zeiten" },
  "hours.weekend": { label: "Wochenende / Feiertage", group: "Zeiten" },
  "location.eyebrow": {
    label: "Standort — kleine Zeile",
    group: "Standort",
  },
  "location.title": { label: "Standort — Titel", group: "Standort" },
  "location.text": {
    label: "Standort — Beschreibung",
    multiline: true,
    group: "Standort",
  },
  "closing.title": { label: "Abschluss — Titel", group: "Startseite" },
  "closing.text": {
    label: "Abschluss — Text",
    multiline: true,
    hint: "Leer = Adresse + Zeiten automatisch",
    group: "Startseite",
  },
  "topBanner.text": { label: "Banner — Text", group: "Banner" },
  "topBanner.highlight": { label: "Banner — Hervorhebung", group: "Banner" },
  "topBanner.linkLabel": { label: "Banner — Link-Text", group: "Banner" },
  "topBanner.suffix": { label: "Banner — Text danach", group: "Banner" },
  "studentLunch.eyebrow": {
    label: "Schüler-Mittag — Überschrift",
    group: "Mittag",
  },
  "studentLunch.title": { label: "Schüler-Mittag — Titel", group: "Mittag" },
  "studentLunch.text": {
    label: "Schüler-Mittag — Text",
    multiline: true,
    group: "Mittag",
  },
  "studentLunch.price": { label: "Schüler-Mittag — Preis", group: "Mittag" },
  "studentLunch.note": { label: "Schüler-Mittag — Hinweis", group: "Mittag" },
  "studentLunch.popupTitle": {
    label: "Popup — Titel",
    group: "Mittag-Popup",
  },
  "studentLunch.popupLead": {
    label: "Popup — Kurztext",
    multiline: true,
    group: "Mittag-Popup",
  },
  "studentLunch.popupBody": {
    label: "Popup — langer Text",
    multiline: true,
    group: "Mittag-Popup",
  },
  "studentLunch.popupBullets": {
    label: "Popup — Punkte",
    multiline: true,
    hint: "Eine Zeile = ein Punkt",
    group: "Mittag-Popup",
  },
  "studentLunch.popupPrice": { label: "Popup — Preis", group: "Mittag-Popup" },
  "studentLunch.popupNote": {
    label: "Popup — Hinweis",
    group: "Mittag-Popup",
  },
  "studentLunch.popupCtaLabel": {
    label: "Popup — Button-Text",
    group: "Mittag-Popup",
  },
};

export function getContentPathValue(
  content: SiteContent,
  path: string,
): string {
  const parts = path.split(".");
  let cursor: unknown = content;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object") return "";
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return typeof cursor === "string" ? cursor : "";
}

export function setContentPathValue(
  content: SiteContent,
  path: string,
  value: string,
): SiteContent {
  const parts = path.split(".");
  if (parts.length === 1) {
    return { ...content, [parts[0]]: value } as SiteContent;
  }
  if (parts.length === 2) {
    const [group, key] = parts;
    const current = (content as Record<string, unknown>)[group];
    if (!current || typeof current !== "object") return content;
    return {
      ...content,
      [group]: {
        ...(current as Record<string, unknown>),
        [key]: value,
      },
    } as SiteContent;
  }
  return content;
}

export const ADMIN_PREVIEW_PARAM = "adminPreview";
export const PREVIEW_EDIT_MSG = "wassana-preview-edit";
export const PREVIEW_DRAFT_MSG = "wassana-preview-draft";
export const PREVIEW_OPEN_POPUP_MSG = "wassana-preview-open-popup";
export const PREVIEW_READY_MSG = "wassana-preview-ready";
