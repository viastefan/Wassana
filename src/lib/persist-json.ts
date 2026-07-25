/** Shared GitHub + disk persistence for admin-editable JSON files. */

export async function writeJsonWithFallback(
  dataPath: string,
  tmpPath: string,
  payload: string,
  githubPath: string,
  commitMessage: string,
) {
  const { promises: fs } = await import("fs");
  const path = await import("path");

  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, payload, "utf8");
  } catch {
    // Vercel read-only
  }

  try {
    await fs.writeFile(tmpPath, payload, "utf8");
  } catch {
    // ignore
  }

  await maybeCommitToGitHub(githubPath, payload, commitMessage);
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
) {
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

  const apiFile = `https://api.github.com/repos/${repo}/contents/${filePath}`;
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
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}
