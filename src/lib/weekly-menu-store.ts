import path from "path";
import { weeklyMenu as fallbackWeekly } from "@/lib/menu";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";
import type { WeeklyMenuData, WeeklyMenuDay } from "@/lib/weekly-menu-store-shared";

export type {
  WeeklyMenuData,
  WeeklyMenuDay,
  WeeklyMenuItem,
} from "@/lib/weekly-menu-store-shared";
export { dayHasExtraInfo } from "@/lib/weekly-menu-store-shared";

const DATA_PATH = path.join(process.cwd(), "data", "weekly-menu.json");
const TMP_PATH = path.join("/tmp", "wassana-weekly-menu.json");

function optionalField(value: unknown, max: number) {
  const next = sanitizeText(String(value || ""), max);
  return next || undefined;
}

export function defaultWeeklyMenu(): WeeklyMenuData {
  return {
    note: fallbackWeekly.note,
    days: fallbackWeekly.days.map((day) => ({
      day: day.day,
      dish: day.dish,
      description: "description" in day ? day.description : "",
      allergens: "allergens" in day ? day.allergens : undefined,
      items: day.items.map((item) => ({
        nr: item.nr,
        name: item.name,
        price: item.price,
        allergens: "allergens" in item ? item.allergens : undefined,
      })),
    })),
    updatedAt: new Date().toISOString(),
  };
}

function normalize(raw: Partial<WeeklyMenuData> | null): WeeklyMenuData {
  const base = defaultWeeklyMenu();
  if (!raw || !Array.isArray(raw.days) || raw.days.length === 0) return base;
  const days = raw.days.slice(0, 14).map((day, index) => ({
    day: sanitizeText(
      String(day.day || base.days[index]?.day || `Tag ${index + 1}`),
      40,
    ),
    dish: sanitizeText(String(day.dish || ""), 200),
    description: sanitizeText(String(day.description || ""), 600),
    allergens: optionalField(day.allergens, 120),
    info: optionalField(
      (day as WeeklyMenuDay).info,
      800,
    ),
    kcal: optionalField((day as WeeklyMenuDay).kcal, 40),
    protein: optionalField((day as WeeklyMenuDay).protein, 40),
    fat: optionalField((day as WeeklyMenuDay).fat, 40),
    carbs: optionalField((day as WeeklyMenuDay).carbs, 40),
    items: Array.isArray(day.items)
      ? day.items.slice(0, 40).map((item) => ({
          nr: sanitizeText(String(item.nr || "–"), 12),
          name: sanitizeText(String(item.name || ""), 160),
          price: sanitizeText(String(item.price || ""), 40),
          allergens: optionalField(item.allergens, 120),
        }))
      : [],
  }));
  return {
    note: sanitizeText(String(raw.note ?? base.note), 600),
    days,
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

export async function getWeeklyMenuData(): Promise<WeeklyMenuData> {
  const raw = await readJsonWithFallback<Partial<WeeklyMenuData>>(
    DATA_PATH,
    TMP_PATH,
    "data/weekly-menu.json",
  );
  if (raw) return normalize(raw);
  return defaultWeeklyMenu();
}

export async function saveWeeklyMenuData(
  input: Omit<WeeklyMenuData, "updatedAt">,
): Promise<{ menu: WeeklyMenuData; persist: PersistResult }> {
  const next = normalize({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/weekly-menu.json",
    "chore: update weekly menu from admin",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(
      persist.error || "Wochen-Favoriten konnten nicht gespeichert werden.",
    );
  }
  return { menu: next, persist };
}
