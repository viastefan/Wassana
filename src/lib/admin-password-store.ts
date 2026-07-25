import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { head, put } from "@vercel/blob";

type PasswordOverrideStore = {
  passwordHash: string;
  updatedAt: string;
};

type ResetTokenStore = {
  tokenHash: string;
  exp: number;
  createdAt: string;
};

const OVERRIDE_TMP = path.join("/tmp", "wassana-admin-password-override.json");
const RESET_TMP = path.join("/tmp", "wassana-admin-password-reset.json");
const OVERRIDE_BLOB = "wassana/admin-password-override.json";
const RESET_BLOB = "wassana/admin-password-reset.json";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

function secretMaterial() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "wassana-dev-only"
  );
}

export function hashAdminPassword(password: string) {
  return createHmac("sha256", `wassana-admin-pw:${secretMaterial()}`)
    .update(password)
    .digest("hex");
}

function hashToken(token: string) {
  return createHmac("sha256", `wassana-admin-reset:${secretMaterial()}`)
    .update(token)
    .digest("hex");
}

function safeEqualHex(a: string, b: string) {
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const token = blobToken();
  if (!token) return null;
  try {
    const meta = await head(pathname, { token });
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function writeBlobJson(pathname: string, data: unknown) {
  const token = blobToken();
  if (!token) return false;
  try {
    await put(pathname, `${JSON.stringify(data)}\n`, {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return true;
  } catch {
    return false;
  }
}

async function getOverrideStore(): Promise<PasswordOverrideStore | null> {
  return (
    (await readBlobJson<PasswordOverrideStore>(OVERRIDE_BLOB)) ||
    (await readJsonFile<PasswordOverrideStore>(OVERRIDE_TMP))
  );
}

export async function getAdminPasswordOverrideHash(): Promise<string | null> {
  const store = await getOverrideStore();
  return store?.passwordHash || null;
}

export async function setAdminPasswordOverride(password: string) {
  const next: PasswordOverrideStore = {
    passwordHash: hashAdminPassword(password),
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(OVERRIDE_TMP, next);
  await writeBlobJson(OVERRIDE_BLOB, next);
  return next;
}

export async function verifyPasswordAgainstStore(
  password: string,
): Promise<"override" | "env" | false> {
  if (!password) return false;

  const overrideHash = await getAdminPasswordOverrideHash();
  if (overrideHash) {
    return safeEqualHex(hashAdminPassword(password), overrideHash)
      ? "override"
      : false;
  }

  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!envPassword) {
    if (
      process.env.NODE_ENV !== "production" &&
      !process.env.VERCEL &&
      password === "wassana-dev-only"
    ) {
      return "env";
    }
    return false;
  }

  try {
    const a = Buffer.from(password);
    const b = Buffer.from(envPassword);
    return a.length === b.length && timingSafeEqual(a, b) ? "env" : false;
  } catch {
    return false;
  }
}

export async function createPasswordResetToken() {
  const token = randomBytes(24).toString("base64url");
  const store: ResetTokenStore = {
    tokenHash: hashToken(token),
    exp: Date.now() + 1000 * 60 * 60,
    createdAt: new Date().toISOString(),
  };
  await writeJsonFile(RESET_TMP, store);
  await writeBlobJson(RESET_BLOB, store);
  return token;
}

export async function consumePasswordResetToken(token: string) {
  if (!token) return false;
  const store =
    (await readBlobJson<ResetTokenStore>(RESET_BLOB)) ||
    (await readJsonFile<ResetTokenStore>(RESET_TMP));
  if (!store) return false;
  if (!Number.isFinite(store.exp) || store.exp < Date.now()) return false;
  if (!safeEqualHex(hashToken(token), store.tokenHash)) return false;

  // one-time use
  const cleared: ResetTokenStore = {
    tokenHash: "",
    exp: 0,
    createdAt: new Date().toISOString(),
  };
  await writeJsonFile(RESET_TMP, cleared);
  await writeBlobJson(RESET_BLOB, cleared);
  return true;
}
