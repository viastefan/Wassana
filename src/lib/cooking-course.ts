import { createHmac, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { formatCourseDate } from "@/lib/cooking-course-format";

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

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || "wassana";
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
): Promise<CookingCourse> {
  const next: CookingCourse = {
    active: Boolean(input.active),
    date: String(input.date),
    title: String(input.title || "Thai Kochkurs").trim() || "Thai Kochkurs",
    teaser: String(input.teaser || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  const payload = `${JSON.stringify(next, null, 2)}\n`;

  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, payload, "utf8");
  } catch {
    // Vercel / read-only deploy: keep a writable copy in /tmp
  }

  try {
    await fs.writeFile(TMP_PATH, payload, "utf8");
  } catch {
    // ignore tmp failures in locked-down environments
  }

  await maybeCommitToGitHub(payload);

  return next;
}

async function maybeCommitToGitHub(content: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo =
    process.env.GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main";

  if (!token || !repo) return;

  const apiFile = `https://api.github.com/repos/${repo}/contents/data/cooking-course.json`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "wassana-admin",
  };

  let sha: string | undefined;
  const current = await fetch(`${apiFile}?ref=${encodeURIComponent(branch)}`, {
    headers,
    cache: "no-store",
  });
  if (current.ok) {
    const body = (await current.json()) as { sha?: string };
    sha = body.sha;
  }

  await fetch(apiFile, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "chore: update next cooking course date",
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", getAdminSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expRaw, sig] = parts;
  if (role !== "admin") return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${role}.${expRaw}`;
  const expected = createHmac("sha256", getAdminSecret())
    .update(payload)
    .digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminSecret();
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isPublicPromoVisible(course: CookingCourse): boolean {
  return course.active && isCourseUpcoming(course.date);
}
