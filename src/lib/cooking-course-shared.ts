/** Client-safe cooking-course helpers (no Node/fs). */

export const COURSE_IMAGE_OPTIONS = [
  { src: "/images/ingredients.jpg", label: "Zutaten" },
  { src: "/images/curry.jpg", label: "Curry" },
  { src: "/images/soup.jpg", label: "Suppe" },
  { src: "/images/hero.jpg", label: "Nudelgericht" },
] as const;

export const DEFAULT_COURSE_IMAGE = COURSE_IMAGE_OPTIONS[0].src;

export type CookingCourseData = {
  active: boolean;
  date: string;
  title: string;
  teaser: string;
  image: string;
  pageTitle: string;
  pageText: string;
  updatedAt?: string;
};

export function sanitizeCourseImage(value: string | undefined | null): string {
  const next = String(value || "").trim();
  return COURSE_IMAGE_OPTIONS.some((item) => item.src === next)
    ? next
    : DEFAULT_COURSE_IMAGE;
}

export function defaultCoursePageTitle() {
  return "Thai-Küche näher kennenlernen";
}

export function defaultCoursePageText() {
  return "Schritt für Schritt Pad Thai oder Tom Yam — inkl. Tipps, wo Sie die Zutaten finden.";
}

/** Build YYYY-MM-DD for the next Saturday at least `minDays` ahead. */
export function suggestNewCourseDate(minDays = 10): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + minDays);
  while (date.getDay() !== 6) {
    date.setDate(date.getDate() + 1);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function createBlankCourse(
  overrides: Partial<CookingCourseData> = {},
): CookingCourseData {
  return {
    active: true,
    date: suggestNewCourseDate(),
    title: "Thai Kochkurs",
    teaser: "Noch Plätze frei",
    image: DEFAULT_COURSE_IMAGE,
    pageTitle: defaultCoursePageTitle(),
    pageText: defaultCoursePageText(),
    ...overrides,
  };
}
