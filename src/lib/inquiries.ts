import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { head, put } from "@vercel/blob";
import type {
  ContactInquiry,
  InquiryStatus,
  InquiryStore,
} from "@/lib/inquiries-shared";

export type { ContactInquiry, InquiryStore } from "@/lib/inquiries-shared";

const DATA_PATH = path.join(process.cwd(), "data", "contact-inquiries.json");
const TMP_PATH = path.join("/tmp", "wassana-contact-inquiries.json");
const BLOB_PATHNAME = "wassana/contact-inquiries.enc.json";
const MAX_ITEMS = 500;

const emptyStore: InquiryStore = {
  inquiries: [],
  updatedAt: new Date().toISOString(),
};

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

function inquiriesSecret() {
  return (
    process.env.INQUIRIES_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    ""
  );
}

function encryptionKey(): Buffer | null {
  const secret = inquiriesSecret();
  if (!secret) return null;
  return createHash("sha256").update(`wassana-inquiries:v1:${secret}`).digest();
}

export function isInquiryStoreDurable() {
  return Boolean(blobToken() && encryptionKey());
}

export function inquiryStorageMode(): "blob" | "tmp" | "disk" {
  if (isInquiryStoreDurable()) return "blob";
  if (process.env.VERCEL) return "tmp";
  return "disk";
}

function encryptPayload(plaintext: string): string {
  const key = encryptionKey();
  if (!key) throw new Error("Missing inquiry encryption secret.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptPayload(payload: string): string {
  const key = encryptionKey();
  if (!key) throw new Error("Missing inquiry encryption secret.");
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

function normalizeInquiry(raw: Partial<ContactInquiry>): ContactInquiry {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const statusRaw = String(raw.status || "");
  const status: InquiryStatus =
    statusRaw === "open" || statusRaw === "done" || statusRaw === "new"
      ? statusRaw
      : raw.read
        ? "open"
        : "new";
  const archived = Boolean(raw.archived);
  const read = status === "new" ? false : true;

  return {
    id: String(raw.id || ""),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
    name: String(raw.name || ""),
    email: String(raw.email || ""),
    phone: String(raw.phone || ""),
    subject: String(raw.subject || "Anfrage"),
    message: String(raw.message || ""),
    source: String(raw.source || "website"),
    read,
    status,
    notes: String(raw.notes || ""),
    archived,
    archivedAt: archived
      ? String(raw.archivedAt || raw.updatedAt || createdAt)
      : null,
    mailOwnerSent: Boolean(raw.mailOwnerSent),
    mailGuestSent: Boolean(raw.mailGuestSent),
  };
}

function normalizeStore(
  parsed: Partial<InquiryStore> | null,
): InquiryStore | null {
  if (!parsed || !Array.isArray(parsed.inquiries)) return null;
  return {
    inquiries: parsed.inquiries
      .map((item) => normalizeInquiry(item))
      .filter((item) => item.id),
    updatedAt: String(parsed.updatedAt || new Date().toISOString()),
  };
}

async function readStoreFile(filePath: string): Promise<InquiryStore | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return normalizeStore(JSON.parse(raw) as InquiryStore);
  } catch {
    return null;
  }
}

type EncBlobEnvelope = {
  v: 1;
  ciphertext: string;
  updatedAt: string;
};

async function readStoreFromBlob(): Promise<InquiryStore | null> {
  if (!isInquiryStoreDurable()) return null;

  try {
    const meta = await head(BLOB_PATHNAME, { token: blobToken() });
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    const envelope = (await res.json()) as EncBlobEnvelope;
    if (envelope?.v !== 1 || !envelope.ciphertext) return null;
    const plain = decryptPayload(envelope.ciphertext);
    return normalizeStore(JSON.parse(plain) as InquiryStore);
  } catch {
    return null;
  }
}

async function writeStoreToBlob(store: InquiryStore): Promise<boolean> {
  if (!isInquiryStoreDurable()) return false;

  try {
    const envelope: EncBlobEnvelope = {
      v: 1,
      ciphertext: encryptPayload(JSON.stringify(store)),
      updatedAt: store.updatedAt,
    };
    await put(BLOB_PATHNAME, `${JSON.stringify(envelope)}\n`, {
      access: "public",
      token: blobToken(),
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

/**
 * Persist inquiries locally / encrypted Blob only — never commit PII to GitHub.
 * Prefer Vercel Blob when BLOB_READ_WRITE_TOKEN is set (durable across instances).
 */
async function writeStore(store: InquiryStore): Promise<void> {
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  let disk = false;
  let tmp = false;
  let blob = false;

  blob = await writeStoreToBlob(store);

  // Local / non-Vercel: keep a working copy under data/ for admin UX.
  if (!process.env.VERCEL) {
    try {
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, payload, "utf8");
      disk = true;
    } catch {
      // ignore
    }
  }

  try {
    await fs.writeFile(TMP_PATH, payload, "utf8");
    tmp = true;
  } catch {
    // ignore
  }

  if (!disk && !tmp && !blob) {
    throw new Error("Inquiry store is not writable.");
  }
}

export async function getInquiryStore(): Promise<InquiryStore> {
  const fromBlob = await readStoreFromBlob();
  if (fromBlob) return fromBlob;

  const fromTmp = await readStoreFile(TMP_PATH);
  if (fromTmp) return fromTmp;

  const fromData = await readStoreFile(DATA_PATH);
  if (fromData) return fromData;

  return { ...emptyStore, updatedAt: new Date().toISOString() };
}

export async function listInquiries(options?: {
  includeArchived?: boolean;
}): Promise<ContactInquiry[]> {
  const store = await getInquiryStore();
  const includeArchived = options?.includeArchived !== false;
  return [...store.inquiries]
    .filter((item) => includeArchived || !item.archived)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addInquiry(
  input: Omit<
    ContactInquiry,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "read"
    | "status"
    | "notes"
    | "archived"
    | "archivedAt"
  >,
): Promise<ContactInquiry> {
  const store = await getInquiryStore();
  const now = new Date().toISOString();
  const inquiry: ContactInquiry = {
    id: `inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    read: false,
    status: "new",
    notes: "",
    archived: false,
    archivedAt: null,
    ...input,
  };

  store.inquiries = [inquiry, ...store.inquiries].slice(0, MAX_ITEMS);
  store.updatedAt = now;
  await writeStore(store);
  return inquiry;
}

export async function updateInquiryMailFlags(
  id: string,
  flags: { mailOwnerSent?: boolean; mailGuestSent?: boolean },
): Promise<ContactInquiry | null> {
  return updateInquiry(id, {
    mailOwnerSent: flags.mailOwnerSent,
    mailGuestSent: flags.mailGuestSent,
  });
}

export type InquiryUpdate = {
  read?: boolean;
  status?: InquiryStatus;
  notes?: string;
  archived?: boolean;
  mailOwnerSent?: boolean;
  mailGuestSent?: boolean;
};

export async function updateInquiry(
  id: string,
  patch: InquiryUpdate,
): Promise<ContactInquiry | null> {
  const store = await getInquiryStore();
  let found: ContactInquiry | null = null;
  const now = new Date().toISOString();

  store.inquiries = store.inquiries.map((item) => {
    if (item.id !== id) return item;

    let status = patch.status ?? item.status;
    let read = patch.read ?? item.read;
    let archived = patch.archived ?? item.archived;
    let archivedAt = item.archivedAt;

    if (patch.status === "new") {
      read = false;
    } else if (patch.status === "open" || patch.status === "done") {
      read = true;
    }

    if (patch.read === true && status === "new") {
      status = "open";
    }
    if (patch.read === false) {
      status = "new";
    }

    if (patch.archived === true) {
      archived = true;
      archivedAt = now;
      read = true;
      if (status === "new") status = "open";
    } else if (patch.archived === false) {
      archived = false;
      archivedAt = null;
    }

    found = {
      ...item,
      read,
      status,
      notes:
        patch.notes !== undefined
          ? String(patch.notes).slice(0, 4000)
          : item.notes,
      archived,
      archivedAt,
      mailOwnerSent: patch.mailOwnerSent ?? item.mailOwnerSent,
      mailGuestSent: patch.mailGuestSent ?? item.mailGuestSent,
      updatedAt: now,
    };
    return found;
  });

  if (!found) return null;
  store.updatedAt = now;
  await writeStore(store);
  return found;
}

export async function markInquiryRead(id: string, read = true) {
  return updateInquiry(id, { read });
}

export async function markAllInquiriesRead() {
  const store = await getInquiryStore();
  const now = new Date().toISOString();
  store.inquiries = store.inquiries.map((item) => {
    if (item.read && item.status !== "new") return item;
    return {
      ...item,
      read: true,
      status: item.status === "new" ? "open" : item.status,
      updatedAt: now,
    };
  });
  store.updatedAt = now;
  await writeStore(store);
  return listInquiries();
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const store = await getInquiryStore();
  const before = store.inquiries.length;
  store.inquiries = store.inquiries.filter((item) => item.id !== id);
  if (store.inquiries.length === before) return false;
  store.updatedAt = new Date().toISOString();
  await writeStore(store);
  return true;
}

export async function getInquiryStats(inquiries?: ContactInquiry[]) {
  const list = inquiries ?? (await listInquiries());
  const active = list.filter((item) => !item.archived);
  const unread = active.filter(
    (item) => !item.read || item.status === "new",
  ).length;
  return {
    total: list.length,
    active: active.length,
    archived: list.length - active.length,
    unread,
    done: active.filter((item) => item.status === "done").length,
    open: active.filter((item) => item.status === "open").length,
  };
}
