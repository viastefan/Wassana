/** Client-safe weekly menu types (no Node/fs imports). */

export const WEEKLY_TABLE_SIZE = 12;

export type WeeklyTableRow = {
  dish: string;
  price: string;
};

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
  /** Extra allergy / ingredient notes for the info popup */
  info?: string;
  kcal?: string;
  protein?: string;
  fat?: string;
  carbs?: string;
  items: WeeklyMenuItem[];
};

export type WeeklyMenuData = {
  note: string;
  days: WeeklyMenuDay[];
  /** Simple 12×2 editor (Gericht | Preis) — primary live Speisekarte table. */
  table: WeeklyTableRow[];
  updatedAt: string;
};

export function emptyWeeklyTable(): WeeklyTableRow[] {
  return Array.from({ length: WEEKLY_TABLE_SIZE }, () => ({
    dish: "",
    price: "",
  }));
}

export function flattenDaysToTable(days: WeeklyMenuDay[]): WeeklyTableRow[] {
  const rows: WeeklyTableRow[] = [];
  for (const day of days) {
    for (const item of day.items) {
      const dish = [day.day, day.dish, item.name]
        .map((part) => String(part || "").trim())
        .filter(Boolean)
        .join(" · ");
      rows.push({ dish, price: String(item.price || "").trim() });
      if (rows.length >= WEEKLY_TABLE_SIZE) {
        return rows;
      }
    }
  }
  while (rows.length < WEEKLY_TABLE_SIZE) {
    rows.push({ dish: "", price: "" });
  }
  return rows;
}

export function filledWeeklyTableRows(table: WeeklyTableRow[] | undefined) {
  return (table || []).filter((row) => row.dish.trim() || row.price.trim());
}

export function dayHasExtraInfo(day: WeeklyMenuDay) {
  return Boolean(
    day.info ||
      day.kcal ||
      day.protein ||
      day.fat ||
      day.carbs ||
      day.allergens ||
      day.description,
  );
}
