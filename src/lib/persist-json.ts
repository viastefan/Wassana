/** Durable CMS persistence: versioned Vercel Blob (live) + optional GitHub backup + disk/tmp. */

import { head, put } from "@vercel/blob";

export type PersistResult = {
  disk: boolean;
  tmp: boolean;
  blob: boolean;
  github: boolean;
  durable: boolean;
  error?: string;
};

type MemoryEntry = {
  json: unknown;
  writtenAt: number;
};

/** Same-isolate cache so a publish is visible on the next read immediately. */
const memoryCache = new Map<string, MemoryEntry>();

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

export function isBlobConfigured() {
  return Boolean(blobToken());
}

export function isBlobSuspendedError(message: string) {
  return /suspended|blocked/i.test(message);
}

export async function probeBlobStore(): Promise<{
  configured: boolean;
  usable: boolean;
  suspended: boolean;
  error?: string;
}> {
  const token = blobToken();
  if (!token) {
    return { configured: false, usable: false, suspended: false };
  }

  try {
    await head(cmsLivePath("data/weekly-menu.json"), { token });
    return { configured: true, usable: true, suspended: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isBlobSuspendedError(message)) {
      return {
        configured: true,
        usable: false,
        suspended: true,
        error: message,
      };
    }
    if (/not found|does not exist|404/i.test(message)) {
      return { configured: true, usable: true, suspended: false };
    }
    return {
      configured: true,
      usable: false,
      suspended: false,
      error: message,
    };
  }
}

function onVercel() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

/** Legacy overwriteable Blob pathname (CDN-cached, may be stale). */
export function cmsBlobPath(githubPath: string) {
  const clean = githubPath.replace(/^\//, "");
  return clean.startsWith("cms/") ? clean : `cms/${clean}`;
}

/** Stable live pointer. Overwritten on every save; read with uploadedAt cache-bust. */
export function cmsLivePath(githubPath: string) {
  const clean = githubPath.replace(/^\//, "");
  return `cms/live/${clean}`;
}

function remember(githubPath: string, payload: string) {
  try {
    memoryCache.set(githubPath, {
      json: JSON.parse(payload) as unknown,
      writtenAt: Date.now(),
    });
  } catch {
    // ignore invalid JSON
  }
}

function fromMemory<T>(githubPath: string): T | null {
  const hit = memoryCache.get(githubPath);
  if (!hit) return null;
  return hit.json as T;
}

async function fetchBlobJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function readBlobByHead<T>(pathname: string): Promise<T | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const meta = await head(pathname, { token });
    const bust = encodeURIComponent(
      String(meta.uploadedAt || meta.pathname || Date.now()),
    );
    const url = `${meta.url}${meta.url.includes("?") ? "&" : "?"}v=${bust}`;
    return await fetchBlobJson<T>(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isBlobSuspendedError(message)) return null;
    return null;
  }
}

/** Overwritten live pointer — no list() (Hobby advanced-ops limit). */
async function readJsonFromLiveBlob<T>(githubPath: string): Promise<T | null> {
  return readBlobByHead<T>(cmsLivePath(githubPath));
}

/** Fallback for CMS files written before versioned publishes. */
async function readJsonFromLegacyBlob<T>(
  githubPath: string,
): Promise<T | null> {
  return readBlobByHead<T>(cmsBlobPath(githubPath));
}

export async function readJsonFromBlob<T>(
  githubPath: string,
): Promise<T | null> {
  const live = await readJsonFromLiveBlob<T>(githubPath);
  if (live) return live;
  return readJsonFromLegacyBlob<T>(githubPath);
}

function updatedAtMs(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  const stamp = (value as { updatedAt?: unknown }).updatedAt;
  if (typeof stamp !== "string") return 0;
  const ms = Date.parse(stamp);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Live CMS read: memory (this isolate) → versioned Blob → /tmp → git disk.
 * On Vercel the git checkout is a build snapshot and must not beat a Blob publish.
 */
export async function readJsonWithFallback<T>(
  dataPath: string,
  tmpPath: string,
  githubPath: string,
): Promise<T | null> {
  try {
    const { unstable_noStore } = await import("next/cache");
    unstable_noStore();
  } catch {
    // not in a Next.js request
  }

  const fromMemoryHit = fromMemory<T>(githubPath);
  const [fromBlob, fromTmp, fromDisk] = await Promise.all([
    readJsonFromBlob<T>(githubPath),
    readJsonFile<T>(tmpPath),
    readJsonFile<T>(dataPath),
  ]);
  const fromGithub = fromBlob
    ? null
    : await readJsonFromGitHub<T>(githubPath);

  type Candidate = { data: T; ts: number; rank: number };
  const candidates: Candidate[] = [];

  if (fromMemoryHit) {
    candidates.push({
      data: fromMemoryHit,
      ts: Math.max(updatedAtMs(fromMemoryHit), Date.now()),
      rank: 0,
    });
  }
  if (fromBlob) {
    candidates.push({
      data: fromBlob,
      ts: Math.max(updatedAtMs(fromBlob), 1),
      rank: 1,
    });
  }
  if (fromGithub) {
    candidates.push({
      data: fromGithub,
      ts: Math.max(updatedAtMs(fromGithub), 1),
      rank: 1,
    });
  }
  if (fromTmp) {
    candidates.push({ data: fromTmp, ts: updatedAtMs(fromTmp), rank: 2 });
  }
  if (fromDisk) {
    // Git disk on Vercel is only a fallback when nothing else exists.
    if (!onVercel() || (!fromBlob && !fromGithub && !fromTmp && !fromMemoryHit)) {
      candidates.push({ data: fromDisk, ts: updatedAtMs(fromDisk), rank: 3 });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.ts - a.ts || a.rank - b.rank);
  return candidates[0]?.data ?? null;
}

async function writeLiveBlob(
  githubPath: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = blobToken();
  if (!token) {
    return {
      ok: false,
      error:
        "BLOB_READ_WRITE_TOKEN fehlt — Live-CMS auf Vercel nicht möglich.",
    };
  }

  const pathname = cmsLivePath(githubPath);
  const body = content.endsWith("\n") ? content : `${content}\n`;

  try {
    const uploaded = await put(pathname, body, {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    const check = await fetchBlobJson(
      `${uploaded.url}${uploaded.url.includes("?") ? "&" : "?"}v=${Date.now()}`,
    );
    if (!check) {
      return {
        ok: false,
        error:
          "Live-Stand gespeichert, aber nicht lesbar. BLOB_READ_WRITE_TOKEN / Store prüfen.",
      };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blob-Speichern fehlgeschlagen.";
    if (isBlobSuspendedError(message)) {
      return {
        ok: false,
        error:
          "Der Live-Speicher bei Vercel ist gesperrt. Neuen Blob-Store anlegen, dem Projekt zuweisen und neu veröffentlichen.",
      };
    }
    return {
      ok: false,
      error: `Blob-Speichern fehlgeschlagen: ${message}`,
    };
  }
}

export async function writeJsonWithFallback(
  dataPath: string,
  tmpPath: string,
  payload: string,
  githubPath: string,
  commitMessage: string,
): Promise<PersistResult> {
  const { promises: fs } = await import("fs");
  const path = await import("path");

  let disk = false;
  let tmp = false;

  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, payload, "utf8");
    disk = true;
  } catch {
    // Vercel read-only deploy root
  }

  try {
    await fs.writeFile(tmpPath, payload, "utf8");
    tmp = true;
  } catch {
    // ignore
  }

  const blob = await writeLiveBlob(githubPath, payload);
  const github = await maybeCommitToGitHub(githubPath, payload, commitMessage);

  // On Vercel only Blob (or a successful GitHub backup we can also read) is live.
  const durable = onVercel() ? blob.ok || github.ok : disk || blob.ok;
  if (durable) remember(githubPath, payload);

  const result: PersistResult = {
    disk,
    tmp,
    blob: blob.ok,
    github: github.ok,
    durable,
  };

  if (!durable) {
    result.error =
      blob.error ||
      (onVercel()
        ? "Nicht live gespeichert. Neuen Blob-Store in Vercel anlegen, dem Projekt zuweisen und neu veröffentlichen."
        : "Speichern fehlgeschlagen — Datei konnte nicht geschrieben werden.");
  }

  return result;
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const { promises: fs } = await import("fs");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function githubRepoRef() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo =
    process.env.GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main";
  return { token, repo, branch };
}

async function readJsonFromGitHub<T>(filePath: string): Promise<T | null> {
  const { token, repo, branch } = githubRepoRef();
  if (!token || !repo) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "wassana-admin",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { content?: string; encoding?: string };
    if (!body.content) return null;
    const decoded = Buffer.from(body.content, "base64").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

async function maybeCommitToGitHub(
  filePath: string,
  content: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const { token, repo, branch } = githubRepoRef();

  if (!token || !repo) {
    return { ok: false };
  }

  const apiFile = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "wassana-admin",
  };

  async function putWithSha(sha?: string) {
    return fetch(apiFile, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });
  }

  try {
    let sha: string | undefined;
    const current = await fetch(
      `${apiFile}?ref=${encodeURIComponent(branch)}`,
      { headers, cache: "no-store" },
    );
    if (current.ok) {
      const body = (await current.json()) as { sha?: string };
      sha = body.sha;
    }

    let putRes = await putWithSha(sha);

    if (putRes.status === 409) {
      const again = await fetch(
        `${apiFile}?ref=${encodeURIComponent(branch)}`,
        { headers, cache: "no-store" },
      );
      if (again.ok) {
        const body = (await again.json()) as { sha?: string };
        putRes = await putWithSha(body.sha);
      }
    }

    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      return {
        ok: false,
        error: `GitHub-Backup fehlgeschlagen (${putRes.status}). ${text.slice(0, 120)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "GitHub-Backup fehlgeschlagen.",
    };
  }
}
