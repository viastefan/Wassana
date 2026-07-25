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

async function writeStore(store: InquiryStore) {
  const payload = `${JSON.stringify(store, null, 2)}\n`;

  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, payload, "utf8");
  } catch {
    // Vercel read-only deploy root
  }

  try {
    await fs.writeFile(TMP_PATH, payload, "utf8");
  } catch {
    // ignore
  }

  await maybeCommitToGitHub(payload);
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

  const apiFile = `https://api.github.com/repos/${repo}/contents/data/contact-inquiries.json`;
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
      message: "chore: update contact inquiries",
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}
