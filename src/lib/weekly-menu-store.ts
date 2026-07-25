import path from "path";
import { weeklyMenu as fallbackWeekly } from "@/lib/menu";
import { readJsonFile, writeJsonWithFallback } from "@/lib/persist-json";

export type WeeklyMenuItem = {
  nr: string;
  name: string;
  price: string;
  allergens?: string;
};

export type WeeklyMenuDay = {
  day: string;
  dish: string;
  description?: string;
  allergens?: string;
  items: WeeklyMenuItem[];
};

export type WeeklyMenuData = {
  note: string;
  days: WeeklyMenuDay[];
  updatedAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "weekly-menu.json");
const TMP_PATH = path.join("/tmp", "wassana-weekly-menu.json");

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
  return {
    note: String(raw.note ?? base.note),
    days: raw.days.map((day, index) => ({
      day: String(day.day || base.days[index]?.day || `Tag ${index + 1}`),
      dish: String(day.dish || ""),
      description: String(day.description || ""),
      allergens: day.allergens ? String(day.allergens) : undefined,
      items: Array.isArray(day.items)
        ? day.items.map((item) => ({
            nr: String(item.nr || "–"),
            name: String(item.name || ""),
            price: String(item.price || ""),
            allergens: item.allergens ? String(item.allergens) : undefined,
          }))
        : [],
    })),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

export async function getWeeklyMenuData(): Promise<WeeklyMenuData> {
  const fromTmp = await readJsonFile<Partial<WeeklyMenuData>>(TMP_PATH);
  if (fromTmp) return normalize(fromTmp);
  const fromData = await readJsonFile<Partial<WeeklyMenuData>>(DATA_PATH);
  if (fromData) return normalize(fromData);
  return defaultWeeklyMenu();
}

export async function saveWeeklyMenuData(
  input: Omit<WeeklyMenuData, "updatedAt">,
): Promise<WeeklyMenuData> {
  const next = normalize({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/weekly-menu.json",
    "chore: update weekly menu from admin",
  );
  return next;
}
