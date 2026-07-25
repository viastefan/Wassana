import type { MetadataRoute } from "next";
import { buildAutoSitemap } from "@/lib/public-routes";
import { getSiteUrl } from "@/lib/site";

/** Regenerates on each request so new public pages appear automatically. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildAutoSitemap(getSiteUrl());
}
