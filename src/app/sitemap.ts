import type { MetadataRoute } from "next";
import { buildAutoSitemap } from "@/lib/public-routes";

/**
 * Generated at build time (source tree available) so new public `page.tsx`
 * files are picked up on each deploy. URLs match link rel=canonical (www, no slash).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildAutoSitemap();
}
