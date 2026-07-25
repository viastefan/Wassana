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
  updatedAt: string;
};

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
