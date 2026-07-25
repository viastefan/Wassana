import path from "path";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
import {
  defaultSitePages,
  normalizeSitePages,
  type SitePages,
} from "@/lib/site-pages-shared";

export type { SitePages, FaqItem } from "@/lib/site-pages-shared";
export {
  defaultSitePages,
  fillTemplate,
  normalizeSitePages,
} from "@/lib/site-pages-shared";

const DATA_PATH = path.join(process.cwd(), "data", "site-pages.json");
const TMP_PATH = path.join("/tmp", "wassana-site-pages.json");

export async function getSitePages(): Promise<SitePages> {
  const raw = await readJsonWithFallback<Partial<SitePages>>(
    DATA_PATH,
    TMP_PATH,
    "data/site-pages.json",
  );
  return normalizeSitePages(raw);
}

export async function saveSitePages(
  input: SitePages,
): Promise<{ pages: SitePages; persist: PersistResult }> {
  const next = normalizeSitePages({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/site-pages.json",
    "chore: update site pages copy from admin",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(
      persist.error || "Website-Texte konnten nicht gespeichert werden.",
    );
  }
  return { pages: next, persist };
}

export function defaultSitePagesFile(): SitePages {
  return defaultSitePages();
}
