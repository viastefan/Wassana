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
  type CookingCourseStoreData,
} from "@/lib/cooking-course-shared";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
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
  type CookingCourseStoreData,
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

async function writeStore(
  store: CookingCourseStore,
  commitMessage: string,
): Promise<PersistResult> {
  const payloadObj: CookingCourseStoreData = {
    current: store.current,
    archive: store.archive,
  };
  const payload = `${JSON.stringify(payloadObj, null, 2)}\n`;
  return writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/cooking-course.json",
    commitMessage,
  );
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

export async function saveCookingCourse(
  input: Omit<CookingCourse, "updatedAt">,
): Promise<{ course: CookingCourse; persist: PersistResult }> {
  const store = await getCookingCourseStore();
  const next = normalizeCourse({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const persist = await writeStore(
    { current: next, archive: store.archive },
    "chore: update next cooking course",
  );

  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Kochkurs konnte nicht gespeichert werden.");
  }

  return { course: next, persist };
}

export async function completeCookingCourse(input: {
  fazit?: string;
  notes?: string;
}): Promise<{ store: CookingCourseStore; persist: PersistResult }> {
  const store = await getCookingCourseStore();
  const current = store.current;
  if (!current.date || !current.title) {
    throw new Error("Kein Kurs zum Abhaken vorhanden.");
  }

  const entry = normalizeArchiveEntry({
    id: createCourseId(current.date, current.title),
    date: current.date,
    title: current.title,
    teaser: current.teaser,
    image: current.image,
    pageTitle: current.pageTitle,
    pageText: current.pageText,
    price: current.price,
    duration: current.duration,
    startTime: current.startTime,
    maxParticipants: current.maxParticipants,
    locationNote: current.locationNote,
    includes: current.includes,
    whatToBring: current.whatToBring,
    level: current.level,
    dishFocus: current.dishFocus,
    fazit: input.fazit || "",
    notes: input.notes || "",
    completedAt: new Date().toISOString(),
  });

  if (!entry) {
    throw new Error("Kurs konnte nicht archiviert werden.");
  }

  const nextStore: CookingCourseStore = {
    current: {
      ...createBlankCourse({ active: false }),
      updatedAt: new Date().toISOString(),
    },
    archive: [entry, ...store.archive.filter((item) => item.id !== entry.id)],
  };

  const persist = await writeStore(
    nextStore,
    `chore: archive cooking course ${entry.date}`,
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Abhaken fehlgeschlagen.");
  }
  return { store: nextStore, persist };
}

export async function deleteCurrentCookingCourse(): Promise<{
  store: CookingCourseStore;
  persist: PersistResult;
}> {
  const store = await getCookingCourseStore();
  const nextStore: CookingCourseStore = {
    current: {
      ...createBlankCourse({ active: false }),
      updatedAt: new Date().toISOString(),
    },
    archive: store.archive,
  };
  const persist = await writeStore(
    nextStore,
    "chore: clear current cooking course",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Löschen fehlgeschlagen.");
  }
  return { store: nextStore, persist };
}

export async function deleteArchivedCookingCourse(id: string): Promise<{
  store: CookingCourseStore;
  persist: PersistResult;
}> {
  const store = await getCookingCourseStore();
  const nextArchive = store.archive.filter((entry) => entry.id !== id);
  if (nextArchive.length === store.archive.length) {
    throw new Error("Archiv-Eintrag nicht gefunden.");
  }
  const nextStore = { current: store.current, archive: nextArchive };
  const persist = await writeStore(
    nextStore,
    "chore: delete archived cooking course",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Löschen fehlgeschlagen.");
  }
  return { store: nextStore, persist };
}

export async function updateArchivedCookingCourse(input: {
  id: string;
  fazit?: string;
  notes?: string;
}): Promise<{ store: CookingCourseStore; persist: PersistResult }> {
  const store = await getCookingCourseStore();
  const index = store.archive.findIndex((entry) => entry.id === input.id);
  if (index < 0) {
    throw new Error("Archiv-Eintrag nicht gefunden.");
  }
  const previous = store.archive[index];
  const updated = normalizeArchiveEntry({
    ...previous,
    fazit: input.fazit ?? previous.fazit,
    notes: input.notes ?? previous.notes,
  });
  if (!updated) {
    throw new Error("Archiv-Eintrag ungültig.");
  }
  const archive = [...store.archive];
  archive[index] = updated;
  const nextStore = { current: store.current, archive };
  const persist = await writeStore(
    nextStore,
    "chore: update cooking course fazit",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(persist.error || "Speichern fehlgeschlagen.");
  }
  return { store: nextStore, persist };
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
