import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/speisekarte", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/catering", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/kochkurs", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/kontakt", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/impressum", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/datenschutz", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
