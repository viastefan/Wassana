/** Shared GitHub + disk persistence for admin-editable JSON files. */

export type PersistResult = {
  disk: boolean;
  tmp: boolean;
  github: boolean;
  durable: boolean;
  error?: string;
};

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

  const github = await maybeCommitToGitHub(githubPath, payload, commitMessage);
  const durable = disk || github.ok;
  const result: PersistResult = {
    disk,
    tmp,
    github: github.ok,
    durable,
  };

  if (!tmp && !disk && !github.ok) {
    result.error =
      github.error ||
      "Speichern fehlgeschlagen — weder Dateisystem noch GitHub erreichbar.";
  } else if (!durable) {
    result.error =
      "Nur temporär gespeichert. GITHUB_TOKEN setzen für dauerhafte Speicherung auf Vercel.";
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

  if (!token) {
    return {
      ok: false,
      error:
        "GITHUB_TOKEN fehlt in Vercel — Änderungen werden nicht dauerhaft auf .de veröffentlicht.",
    };
  }
  if (!repo) {
    return {
      ok: false,
      error:
        "GITHUB_REPO fehlt (oder Git-Metadaten). Bitte GITHUB_REPO=viastefan/Wassana setzen.",
    };
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

    // Race: file changed — refresh SHA once
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
        error: `GitHub-Speichern fehlgeschlagen (${put.status}). ${text.slice(0, 120)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "GitHub-Speichern fehlgeschlagen.",
    };
  }
}
