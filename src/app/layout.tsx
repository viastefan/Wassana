import type { Metadata, Viewport } from "next";
import { Special_Elite } from "next/font/google";
import {
  JsonLdLocalBusiness,
  JsonLdSiteNavigation,
  JsonLdWebSite,
} from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { getResolvedBusiness } from "@/lib/business-profile";
import { getSiteContent } from "@/lib/site-content";
import { getSitePages } from "@/lib/site-pages";
import { CANONICAL_SITE_URL, site } from "@/lib/site";
import "./globals.css";

/** CMS texts must refresh after admin saves (Vercel /tmp + GitHub). */
export const dynamic = "force-dynamic";

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** www only — keeps link rel=canonical / OG URLs off apex and preview hosts. */
const metadataBaseUrl = new URL(CANONICAL_SITE_URL);

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee4" },
    { media: "(prefers-color-scheme: dark)", color: "#7a0c24" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: "Wassana Thai Imbiss Landshut | Curry, Wok & Mitnehmen",
    template: "%s | Wassana Thai Imbiss Landshut",
  },
  description:
    "Thai Imbiss in Landshut am Regierungsplatz: authentische Curries, Wok-Gerichte & Suppen. Mo–Fr 11–18 Uhr. Catering & Kochkurs. Jetzt Speisekarte ansehen.",
  applicationName: site.shortName,
  keywords: [...site.seo.keywords],
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "restaurant",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.seo.locale,
    url: CANONICAL_SITE_URL,
    siteName: site.shortName,
    title: "Wassana Thai Imbiss Landshut | Authentisch & frisch",
    description:
      "Dein Thai Imbiss in Landshut: Curries, Wok, Suppen, Catering und Kochkurs am Regierungsplatz 542.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 2400,
        height: 1600,
        alt: "Thai-Gericht bei Wassana Thai Imbiss in Landshut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wassana Thai Imbiss Landshut",
    description:
      "Authentische Thai-Küche in Landshut — Speisekarte, Catering & Kochkurs.",
    images: ["/images/hero.jpg"],
  },
  robots: {
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Wassana",
    statusBarStyle: "default",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    "geo.region": "DE-BY",
    "geo.placename": "Landshut",
    "geo.position": `${site.geo.latitude};${site.geo.longitude}`,
    ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
    "apple-mobile-web-app-title": "Wassana",
    "msapplication-TileColor": "#7a0c24",
    "msapplication-TileImage": "/icon-192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [content, pages, business] = await Promise.all([
    getSiteContent(),
    getSitePages(),
    getResolvedBusiness(),
  ]);

  return (
    <html lang="de">
      <body className={`${typewriter.variable} antialiased`}>
        <JsonLdLocalBusiness business={business} />
        <JsonLdWebSite business={business} />
        <JsonLdSiteNavigation />
        <PublicChrome content={content} pages={pages} business={business}>
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
