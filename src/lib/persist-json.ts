/** Durable CMS persistence: Vercel Blob (live) + optional GitHub backup + disk/tmp. */

import { head, put } from "@vercel/blob";

export type PersistResult = {
  disk: boolean;
  tmp: boolean;
  blob: boolean;
  github: boolean;
  durable: boolean;
  error?: string;
};

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

export function isBlobConfigured() {
  return Boolean(blobToken());
}

/** Blob pathname for a CMS file (stable, overwriteable). */
export function cmsBlobPath(githubPath: string) {
  const clean = githubPath.replace(/^\//, "");
  return clean.startsWith("cms/") ? clean : `cms/${clean}`;
}

async function writeToBlob(
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

  try {
    await put(cmsBlobPath(githubPath), content.endsWith("\n") ? content : `${content}\n`, {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      // CMS must be readable immediately after Admin publish.
      cacheControlMaxAge: 0,
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Blob-Speichern fehlgeschlagen: ${error.message}`
          : "Blob-Speichern fehlgeschlagen.",
    };
  }
}

export async function readJsonFromBlob<T>(
  githubPath: string,
): Promise<T | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const meta = await head(cmsBlobPath(githubPath), { token });
    const bust = encodeURIComponent(
      String(meta.uploadedAt || meta.pathname || Date.now()),
    );
    const url = `${meta.url}${meta.url.includes("?") ? "&" : "?"}v=${bust}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function updatedAtMs(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  const stamp = (value as { updatedAt?: unknown }).updatedAt;
  if (typeof stamp !== "string") return 0;
  const ms = Date.parse(stamp);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Read order for live CMS: freshest among Blob, /tmp, and repo data file.
 * After an Admin save, Blob is usually newest — but CDN lag can briefly
 * leave Blob behind local/tmp writes, so we compare `updatedAt`.
 */
export async function readJsonWithFallback<T>(
  dataPath: string,
  tmpPath: string,
  githubPath: string,
): Promise<T | null> {
  const [fromBlob, fromTmp, fromDisk] = await Promise.all([
    readJsonFromBlob<T>(githubPath),
    readJsonFile<T>(tmpPath),
    readJsonFile<T>(dataPath),
  ]);

  const candidates: T[] = [];
  if (fromBlob) candidates.push(fromBlob);
  if (fromTmp) candidates.push(fromTmp);
  if (fromDisk) candidates.push(fromDisk);
  if (!candidates.length) return null;

  candidates.sort((a, b) => updatedAtMs(b) - updatedAtMs(a));
  return candidates[0] ?? null;
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

  const blob = await writeToBlob(githubPath, payload);
  // GitHub remains optional backup / history — not required for live .de
  const github = await maybeCommitToGitHub(githubPath, payload, commitMessage);

  const durable = disk || blob.ok || github.ok;
  const result: PersistResult = {
    disk,
    tmp,
    blob: blob.ok,
    github: github.ok,
    durable,
  };

  if (!tmp && !disk && !blob.ok && !github.ok) {
    result.error =
      blob.error ||
      github.error ||
      "Speichern fehlgeschlagen — weder Blob noch Dateisystem erreichbar.";
  } else if (!durable) {
    result.error =
      blob.error ||
      "Nur temporär gespeichert. BLOB_READ_WRITE_TOKEN in Vercel prüfen.";
  } else if (blob.ok && !github.ok && process.env.VERCEL) {
    // Soft note only — live works via Blob without GitHub.
    result.error = undefined;
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

async function maybeCommitToGitHub(
  filePath: string,
  content: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
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

    let put = await putWithSha(sha);

    if (put.status === 409) {
      const again = await fetch(
        `${apiFile}?ref=${encodeURIComponent(branch)}`,
        { headers, cache: "no-store" },
      );
      if (again.ok) {
        const body = (await again.json()) as { sha?: string };
        put = await putWithSha(body.sha);
      }
    }

    if (!put.ok) {
      const text = await put.text().catch(() => "");
      return {
        ok: false,
        error: `GitHub-Backup fehlgeschlagen (${put.status}). ${text.slice(0, 120)}`,
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
