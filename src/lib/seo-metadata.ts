import type { Metadata } from "next";
import { CANONICAL_SITE_URL, site } from "@/lib/site";

type PageMetaInput = {
  /** Short title — template appends "| Wassana Thai Imbiss Landshut" unless absolute. */
  title: string;
  description: string;
  path: string;
  /** Use absolute title (no template suffix). */
  absoluteTitle?: boolean;
  keywords?: string[];
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt: string;
  };
  noIndex?: boolean;
};

const DEFAULT_IMAGE = {
  url: "/images/hero.jpg",
  width: 2400,
  height: 1600,
  alt: "Thai-Gericht bei Wassana Thai Imbiss in Landshut",
} as const;

/**
 * Consistent Metadata for Google + social: canonical, Open Graph, Twitter cards.
 * Always www host via metadataBase in root layout.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  keywords,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: PageMetaInput): Metadata {
  const urlPath = path === "/" ? "/" : path.replace(/\/$/, "");
  const ogTitle = absoluteTitle
    ? title
    : `${title} | Wassana Thai Imbiss Landshut`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords: [...keywords] } : {}),
    alternates: { canonical: urlPath },
    openGraph: {
      type: "website",
      locale: site.seo.locale,
      url: urlPath,
      siteName: site.shortName,
      title: ogTitle,
      description,
      images: [
        {
          url: image.url,
          width: image.width ?? 1600,
          height: image.height ?? 1067,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image.url],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/** Berlin wall-clock → ISO-8601 with correct CET/CEST offset (Google Event). */
export function berlinDateTime(date: string, time = "18:00"): string {
  const hhmm = /^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, "0") : "18:00";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return `${date}T${hhmm}:00+01:00`;
  const offset = isEuSummerTime(y, m, d) ? "+02:00" : "+01:00";
  return `${date}T${hhmm}:00${offset}`;
}

/** EU DST: last Sunday of March → last Sunday of October (inclusive start). */
function isEuSummerTime(year: number, month: number, day: number): boolean {
  if (month < 3 || month > 10) return false;
  if (month > 3 && month < 10) return true;
  const lastSunday = (y: number, m: number) => {
    const last = new Date(Date.UTC(y, m, 0));
    const dow = last.getUTCDay();
    return last.getUTCDate() - dow;
  };
  if (month === 3) return day >= lastSunday(year, 3);
  return day < lastSunday(year, 10);
}

export function absoluteCanonical(path: string): string {
  const base = CANONICAL_SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`.replace(
    /\/$/,
    "",
  );
}
