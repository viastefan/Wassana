import { createHmac, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { formatCourseDate } from "@/lib/cooking-course-format";
import {
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";

export type CookingCourse = {
  active: boolean;
  date: string; // YYYY-MM-DD
  title: string;
  teaser: string;
  updatedAt: string;
};

export { formatCourseDate };

export const COOKING_COURSE_COOKIE = "wassana_admin";

const DATA_PATH = path.join(process.cwd(), "data", "cooking-course.json");
const TMP_PATH = path.join("/tmp", "wassana-cooking-course.json");

const fallbackCourse: CookingCourse = {
  active: true,
  date: "2027-01-24",
  title: "Thai Kochkurs",
  teaser: "Noch Plätze frei",
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

async function readJsonFile(filePath: string): Promise<CookingCourse | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as CookingCourse;
    if (!parsed?.date || typeof parsed.active !== "boolean") return null;
    return {
      active: Boolean(parsed.active),
      date: String(parsed.date),
      title: String(parsed.title || "Thai Kochkurs"),
      teaser: String(parsed.teaser || ""),
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export async function getCookingCourse(): Promise<CookingCourse> {
  const fromTmp = await readJsonFile(TMP_PATH);
  if (fromTmp) return fromTmp;
  const fromData = await readJsonFile(DATA_PATH);
  if (fromData) return fromData;
  return fallbackCourse;
}

export async function saveCookingCourse(
  input: Omit<CookingCourse, "updatedAt">,
): Promise<{ course: CookingCourse; persist: PersistResult }> {
  const next: CookingCourse = {
    active: Boolean(input.active),
    date: String(input.date),
    title:
      sanitizeText(String(input.title || "Thai Kochkurs"), 120) ||
      "Thai Kochkurs",
    teaser: sanitizeText(String(input.teaser || ""), 200),
    updatedAt: new Date().toISOString(),
  };

  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/cooking-course.json",
    "chore: update next cooking course date",
  );

  if (!persist.tmp && !persist.disk && !persist.github) {
    throw new Error(persist.error || "Kochkurs konnte nicht gespeichert werden.");
  }

  return { course: next, persist };
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

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !password) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function isPublicPromoVisible(course: CookingCourse): boolean {
  return course.active && isCourseUpcoming(course.date);
}
