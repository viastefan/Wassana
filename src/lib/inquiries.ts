import { promises as fs } from "fs";
import path from "path";

export type ContactInquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  read: boolean;
  mailOwnerSent: boolean;
  mailGuestSent: boolean;
};

export type InquiryStore = {
  inquiries: ContactInquiry[];
  updatedAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "contact-inquiries.json");
const TMP_PATH = path.join("/tmp", "wassana-contact-inquiries.json");
const MAX_ITEMS = 200;

const emptyStore: InquiryStore = {
  inquiries: [],
  updatedAt: new Date().toISOString(),
};

async function readStoreFile(filePath: string): Promise<InquiryStore | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as InquiryStore;
    if (!Array.isArray(parsed?.inquiries)) return null;
    return {
      inquiries: parsed.inquiries.map((item) => ({
        id: String(item.id),
        createdAt: String(item.createdAt),
        name: String(item.name || ""),
        email: String(item.email || ""),
        phone: String(item.phone || ""),
        subject: String(item.subject || "Anfrage"),
        message: String(item.message || ""),
        source: String(item.source || "website"),
        read: Boolean(item.read),
        mailOwnerSent: Boolean(item.mailOwnerSent),
        mailGuestSent: Boolean(item.mailGuestSent),
      })),
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

/**
 * Persist inquiries locally only — never commit PII to GitHub.
 * On Vercel, /tmp is writable per instance; e-mail remains the durable channel.
 */
async function writeStore(store: InquiryStore): Promise<void> {
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  let disk = false;
  let tmp = false;

  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, payload, "utf8");
    disk = true;
  } catch {
    // Vercel read-only deploy root
  }

  try {
    await fs.writeFile(TMP_PATH, payload, "utf8");
    tmp = true;
  } catch {
    // ignore
  }

  if (!disk && !tmp) {
    throw new Error("Inquiry store is not writable.");
  }
}

export async function getInquiryStore(): Promise<InquiryStore> {
  const fromTmp = await readStoreFile(TMP_PATH);
  if (fromTmp) return fromTmp;
  const fromData = await readStoreFile(DATA_PATH);
  if (fromData) return fromData;
  return emptyStore;
}

export async function listInquiries(): Promise<ContactInquiry[]> {
  const store = await getInquiryStore();
  return [...store.inquiries].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export async function addInquiry(
  input: Omit<ContactInquiry, "id" | "createdAt" | "read">,
): Promise<ContactInquiry> {
  const store = await getInquiryStore();
  const inquiry: ContactInquiry = {
    id: `inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  };

  store.inquiries = [inquiry, ...store.inquiries].slice(0, MAX_ITEMS);
  store.updatedAt = inquiry.createdAt;
  await writeStore(store);
  return inquiry;
}

export async function updateInquiryMailFlags(
  id: string,
  flags: { mailOwnerSent?: boolean; mailGuestSent?: boolean },
): Promise<ContactInquiry | null> {
  const store = await getInquiryStore();
  let found: ContactInquiry | null = null;
  store.inquiries = store.inquiries.map((item) => {
    if (item.id !== id) return item;
    found = {
      ...item,
      mailOwnerSent: flags.mailOwnerSent ?? item.mailOwnerSent,
      mailGuestSent: flags.mailGuestSent ?? item.mailGuestSent,
    };
    return found;
  });
  if (!found) return null;
  store.updatedAt = new Date().toISOString();
  await writeStore(store);
  return found;
}

export async function markInquiryRead(id: string, read = true) {
  const store = await getInquiryStore();
  let found = false;
  store.inquiries = store.inquiries.map((item) => {
    if (item.id !== id) return item;
    found = true;
    return { ...item, read };
  });
  if (!found) return null;
  store.updatedAt = new Date().toISOString();
  await writeStore(store);
  return store.inquiries.find((item) => item.id === id) || null;
}

export async function markAllInquiriesRead() {
  const store = await getInquiryStore();
  store.inquiries = store.inquiries.map((item) => ({ ...item, read: true }));
  store.updatedAt = new Date().toISOString();
  await writeStore(store);
  return listInquiries();
}
