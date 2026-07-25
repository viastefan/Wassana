import path from "path";
import { menuSections as fallbackSections, type MenuSection } from "@/lib/menu";
import {
  blankMenuItem,
  slugifyMenuId,
  type FullMenuData,
  type FullMenuItem,
  type FullMenuSection,
} from "@/lib/menu-store-shared";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";

export type { FullMenuData, FullMenuItem, FullMenuSection } from "@/lib/menu-store-shared";
export {
  blankMenuItem,
  blankMenuSection,
  slugifyMenuId,
} from "@/lib/menu-store-shared";

const DATA_PATH = path.join(process.cwd(), "data", "menu-sections.json");
const TMP_PATH = path.join("/tmp", "wassana-menu-sections.json");

function fromLegacySection(section: MenuSection): FullMenuSection {
  return {
    id: section.id,
    title: section.title,
    note: section.note || "",
    items: section.items.map((item) => ({
      nr: item.nr || "",
      name: item.name,
      description: item.description || "",
      price: item.price,
      allergens: item.allergens || "",
    })),
  };
}

export function defaultFullMenu(): FullMenuData {
  return {
    sections: fallbackSections.map(fromLegacySection),
    updatedAt: new Date().toISOString(),
  };
}

/** Public shape used by Speisekarte / JSON-LD. */
export function toPublicMenuSections(data: FullMenuData): MenuSection[] {
  return data.sections.map((section) => ({
    id: section.id,
    title: section.title,
    note: section.note.trim() || undefined,
    items: section.items.map((item) => ({
      nr: item.nr,
      name: item.name,
      description: item.description.trim() || undefined,
      price: item.price,
      allergens: item.allergens.trim() || undefined,
    })),
  }));
}

function uniqueId(desired: string, used: Set<string>): string {
  let id = sanitizeText(desired, 40) || "kategorie";
  id = slugifyMenuId(id);
  if (!used.has(id)) {
    used.add(id);
    return id;
  }
  let n = 2;
  while (used.has(`${id}-${n}`)) n += 1;
  const next = `${id}-${n}`;
  used.add(next);
  return next;
}

function normalize(raw: Partial<FullMenuData> | null): FullMenuData {
  const base = defaultFullMenu();
  if (!raw || !Array.isArray(raw.sections) || raw.sections.length === 0) {
    return base;
  }

  const used = new Set<string>();
  const sections = raw.sections.slice(0, 30).map((section, index) => {
    const title =
      sanitizeText(
        String(
          section?.title ||
            base.sections[index]?.title ||
            `Kategorie ${index + 1}`,
        ),
        80,
      ) || `Kategorie ${index + 1}`;
    const desiredId = String(section?.id || slugifyMenuId(title));
    return {
      id: uniqueId(desiredId, used),
      title,
      note: sanitizeText(String(section?.note || ""), 400),
      items: Array.isArray(section?.items)
        ? section.items.slice(0, 80).map((item) => ({
            nr: sanitizeText(String(item?.nr || ""), 12),
            name: sanitizeText(String(item?.name || ""), 160),
            description: sanitizeText(String(item?.description || ""), 400),
            price: sanitizeText(String(item?.price || ""), 80),
            allergens: sanitizeText(String(item?.allergens || ""), 120),
          }))
        : [blankMenuItem()],
    };
  });

  return {
    sections,
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

export async function getFullMenuData(): Promise<FullMenuData> {
  const raw = await readJsonWithFallback<Partial<FullMenuData>>(
    DATA_PATH,
    TMP_PATH,
    "data/menu-sections.json",
  );
  if (raw) return normalize(raw);
  return defaultFullMenu();
}

export async function getPublicMenuSections(): Promise<MenuSection[]> {
  const data = await getFullMenuData();
  return toPublicMenuSections(data);
}

export async function saveFullMenuData(
  input: Omit<FullMenuData, "updatedAt">,
): Promise<{ menu: FullMenuData; persist: PersistResult }> {
  const next = normalize({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/menu-sections.json",
    "chore: update full menu from admin",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(
      persist.error || "Speisekarte konnte nicht gespeichert werden.",
    );
  }
  return { menu: next, persist };
}
