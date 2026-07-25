/** Client-safe full-menu helpers (no Node/fs). */

export type FullMenuItem = {
  nr: string;
  name: string;
  description: string;
  price: string;
  allergens: string;
  /** Optional photo URL (Admin upload). Not shown on the public Speisekarte yet. */
  image?: string;
};

export type FullMenuSection = {
  id: string;
  title: string;
  note: string;
  items: FullMenuItem[];
};

export type FullMenuData = {
  sections: FullMenuSection[];
  updatedAt: string;
};

export function slugifyMenuId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "kategorie";
}

export function blankMenuItem(): FullMenuItem {
  return {
    nr: "",
    name: "",
    description: "",
    price: "",
    allergens: "",
    image: "",
  };
}

export function blankMenuSection(title = "Neue Kategorie"): FullMenuSection {
  return {
    id: slugifyMenuId(title),
    title,
    note: "",
    items: [blankMenuItem()],
  };
}
