import { createHmac, timingSafeEqual } from "crypto";
import path from "path";
import { formatCourseDate } from "@/lib/cooking-course-format";
import {
  createBlankCourse,
  createCourseId,
  defaultCourseDetails,
  defaultCoursePageText,
  defaultCoursePageTitle,
  sanitizeCourseImage,
  type CookingCourseArchiveEntry,
  type CookingCourseData,
} from "@/lib/cooking-course-shared";
import { readJsonWithFallback } from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";

export type CookingCourse = CookingCourseData & {
  updatedAt: string;
};

export type CookingCourseStore = {
  current: CookingCourse;
  archive: CookingCourseArchiveEntry[];
};

export {
  COURSE_IMAGE_OPTIONS,
  createBlankCourse,
  createCourseId,
  defaultCourseDetails,
  sanitizeCourseImage,
  splitCourseLines,
  suggestNewCourseDate,
  type CookingCourseArchiveEntry,
} from "@/lib/cooking-course-shared";
export { formatCourseDate };

export const COOKING_COURSE_COOKIE = "wassana_admin";

const DATA_PATH = path.join(process.cwd(), "data", "cooking-course.json");
const TMP_PATH = path.join("/tmp", "wassana-cooking-course.json");

const fallbackCourse: CookingCourse = {
  ...createBlankCourse({
    date: "2027-01-24",
    title: "Thai Kochkurs",
    teaser: "Noch Plätze frei",
  }),
  updatedAt: new Date().toISOString(),
};

function isProdLike() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    Boolean(process.env.VERCEL_ENV)
  );
}

/** Admin login password — required in production (no default). */
function getAdminPassword(): string | null {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (secret) return secret;
  if (isProdLike()) return null;
  return "wassana-dev-only";
}

/** HMAC secret for session cookies (prefer dedicated secret). */
function getSessionSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  return getAdminPassword();
}

export function isCourseUpcoming(isoDate: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return false;
  const end = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
  );
  return end.getTime() >= Date.now();
}

function normalizeCourse(raw: Partial<CookingCourseData> | null): CookingCourse {
  const base = createBlankCourse({ active: false });
  const details = defaultCourseDetails();
  return {
    active: typeof raw?.active === "boolean" ? raw.active : base.active,
    date: String(raw?.date || base.date),
    title:
      sanitizeText(String(raw?.title || base.title), 120) || "Thai Kochkurs",
    teaser: sanitizeText(String(raw?.teaser || ""), 200),
    image: sanitizeCourseImage(raw?.image),
    pageTitle:
      sanitizeText(String(raw?.pageTitle || defaultCoursePageTitle()), 160) ||
      defaultCoursePageTitle(),
    pageText:
      sanitizeText(String(raw?.pageText || defaultCoursePageText()), 800) ||
      defaultCoursePageText(),
    price: sanitizeText(String(raw?.price ?? details.price), 80),
    duration: sanitizeText(String(raw?.duration ?? details.duration), 80),
    startTime: sanitizeText(String(raw?.startTime ?? details.startTime), 40),
    maxParticipants: sanitizeText(
      String(raw?.maxParticipants ?? details.maxParticipants),
      20,
    ),
    locationNote: sanitizeText(
      String(raw?.locationNote ?? details.locationNote),
      240,
    ),
    includes: sanitizeText(String(raw?.includes ?? details.includes), 1200),
    whatToBring: sanitizeText(
      String(raw?.whatToBring ?? details.whatToBring),
      800,
    ),
    level: sanitizeText(String(raw?.level ?? details.level), 160),
    dishFocus: sanitizeText(String(raw?.dishFocus ?? details.dishFocus), 160),
    updatedAt: String(raw?.updatedAt || new Date().toISOString()),
  };
}

function normalizeArchiveEntry(
  raw: Partial<CookingCourseArchiveEntry> | null,
): CookingCourseArchiveEntry | null {
  if (!raw?.date || !raw?.title) return null;
  const id =
    sanitizeText(String(raw.id || ""), 80) ||
    createCourseId(String(raw.date), String(raw.title));
  const details = defaultCourseDetails();
  return {
    id,
    date: String(raw.date),
    title: sanitizeText(String(raw.title), 120) || "Thai Kochkurs",
    teaser: sanitizeText(String(raw.teaser || ""), 200),
    image: sanitizeCourseImage(raw.image),
    pageTitle: sanitizeText(String(raw.pageTitle || ""), 160),
    pageText: sanitizeText(String(raw.pageText || ""), 800),
    price: sanitizeText(String(raw.price ?? details.price), 80),
    duration: sanitizeText(String(raw.duration ?? details.duration), 80),
    startTime: sanitizeText(String(raw.startTime ?? details.startTime), 40),
    maxParticipants: sanitizeText(
      String(raw.maxParticipants ?? details.maxParticipants),
      20,
    ),
    locationNote: sanitizeText(
      String(raw.locationNote ?? details.locationNote),
      240,
    ),
    includes: sanitizeText(String(raw.includes ?? ""), 1200),
    whatToBring: sanitizeText(String(raw.whatToBring ?? ""), 800),
    level: sanitizeText(String(raw.level ?? ""), 160),
    dishFocus: sanitizeText(String(raw.dishFocus ?? ""), 160),
    fazit: sanitizeText(String(raw.fazit || ""), 2000),
    notes: sanitizeText(String(raw.notes || ""), 2000),
    completedAt: String(raw.completedAt || new Date().toISOString()),
  };
}

function isLegacyCourseShape(raw: unknown): raw is Partial<CookingCourseData> {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.date === "string" &&
    typeof obj.active === "boolean" &&
    !("current" in obj)
  );
}

function normalizeStore(raw: unknown): CookingCourseStore {
  if (isLegacyCourseShape(raw)) {
    return {
      current: normalizeCourse(raw),
      archive: [],
    };
  }

  const obj = (raw && typeof raw === "object" ? raw : {}) as {
    current?: Partial<CookingCourseData>;
    archive?: Partial<CookingCourseArchiveEntry>[];
  };

  const archive = Array.isArray(obj.archive)
    ? obj.archive
        .map((entry) => normalizeArchiveEntry(entry))
        .filter((entry): entry is CookingCourseArchiveEntry => Boolean(entry))
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    : [];

  return {
    current: normalizeCourse(obj.current || null),
    archive,
  };
}

export async function getCookingCourseStore(): Promise<CookingCourseStore> {
  const raw = await readJsonWithFallback<unknown>(
    DATA_PATH,
    TMP_PATH,
    "data/cooking-course.json",
  );
  if (raw) return normalizeStore(raw);
  return { current: fallbackCourse, archive: [] };
}

export async function getCookingCourse(): Promise<CookingCourse> {
  const store = await getCookingCourseStore();
  return store.current;
}

export function createAdminSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = getSessionSecret();
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expRaw, sig] = parts;
  if (role !== "admin") return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${role}.${expRaw}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const { verifyPasswordAgainstStore } = await import(
    "@/lib/admin-password-store"
  );
  const result = await verifyPasswordAgainstStore(password);
  return result === "override" || result === "env";
}

export async function isAdminConfigured(): Promise<boolean> {
  if (getAdminPassword()) return true;
  const { getAdminPasswordOverrideHash } = await import(
    "@/lib/admin-password-store"
  );
  return Boolean(await getAdminPasswordOverrideHash());
}

export function isPublicPromoVisible(course: CookingCourse): boolean {
  return course.active && isCourseUpcoming(course.date);
}
