import { promises as fs } from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";

/** Segments that must never appear in the public sitemap. */
const BLOCKED_SEGMENTS = new Set([
  "admin",
  "api",
  "_next",
  "node_modules",
]);

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

type RouteMeta = {
  changeFrequency: ChangeFrequency;
  priority: number;
};

/** Optional SEO tuning; new pages still appear automatically with defaults. */
const ROUTE_META: Record<string, RouteMeta> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/speisekarte": { changeFrequency: "daily", priority: 0.95 },
  "/mitnehmen": { changeFrequency: "weekly", priority: 0.9 },
  "/kontakt": { changeFrequency: "monthly", priority: 0.9 },
  "/anfahrt": { changeFrequency: "monthly", priority: 0.88 },
  "/catering": { changeFrequency: "monthly", priority: 0.85 },
  "/kochkurs": { changeFrequency: "weekly", priority: 0.85 },
  "/ueber-uns": { changeFrequency: "monthly", priority: 0.8 },
  "/impressum": { changeFrequency: "yearly", priority: 0.2 },
  "/agb": { changeFrequency: "yearly", priority: 0.2 },
  "/datenschutz": { changeFrequency: "yearly", priority: 0.2 },
};

/** Soft-removed public URLs (redirect / noindex) — keep out of sitemap. */
const HIDDEN_PATHS = new Set(["/schueler-mittagessen"]);

const DEFAULT_META: RouteMeta = {
  changeFrequency: "monthly",
  priority: 0.7,
};

/** Known public routes — used if filesystem discovery is empty (e.g. odd runtimes). */
const FALLBACK_PATHS = Object.keys(ROUTE_META);

function isBlockedSegment(segment: string) {
  if (!segment) return false;
  if (segment.startsWith("_")) return true;
  if (segment.startsWith("(") && segment.endsWith(")")) return false; // route groups
  if (segment.startsWith("@")) return true;
  if (BLOCKED_SEGMENTS.has(segment)) return true;
  // Dynamic segments like [id] — exclude from static sitemap discovery
  if (segment.startsWith("[") && segment.endsWith("]")) return true;
  return false;
}

/**
 * Recursively find App Router `page.tsx` files and map them to URL paths.
 * New public pages under src/app are picked up automatically.
 */
export async function discoverPublicPaths(
  appDir = path.join(process.cwd(), "src", "app"),
): Promise<string[]> {
  const found = new Set<string>();

  async function walk(dir: string, segments: string[]) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      if (entry.isFile() && entry.name === "page.tsx") {
        const clean = segments.filter(
          (seg) => !(seg.startsWith("(") && seg.endsWith(")")),
        );
        const routePath = clean.length === 0 ? "/" : `/${clean.join("/")}`;
        found.add(routePath);
        continue;
      }

      if (!entry.isDirectory()) continue;
      if (isBlockedSegment(entry.name)) continue;

      await walk(path.join(dir, entry.name), [...segments, entry.name]);
    }
  }

  await walk(appDir, []);

  const paths = found.size > 0 ? [...found] : [...FALLBACK_PATHS];
  return paths
    .filter((routePath) => !HIDDEN_PATHS.has(routePath))
    .sort((a, b) => {
    const pa = ROUTE_META[a]?.priority ?? DEFAULT_META.priority;
    const pb = ROUTE_META[b]?.priority ?? DEFAULT_META.priority;
    if (pb !== pa) return pb - pa;
    return a.localeCompare(b);
  });
}

/**
 * Build sitemap entries using the same absolute URLs as link rel=canonical
 * (www host, no trailing slash).
 */
export async function buildAutoSitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await discoverPublicPaths();
  const now = new Date();

  return paths.map((routePath) => {
    const meta = ROUTE_META[routePath] ?? DEFAULT_META;
    return {
      url: canonicalUrl(routePath),
      lastModified: now,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority,
    };
  });
}
