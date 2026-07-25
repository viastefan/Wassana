import type { Metadata } from "next";
import { Special_Elite } from "next/font/google";
import { JsonLdLocalBusiness, JsonLdWebSite } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { getSiteContent } from "@/lib/site-content";
import { getSiteUrl, site } from "@/lib/site";
import "./globals.css";

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wassana Thai Imbiss Landshut | Curry, Wok & Mitnehmen",
    template: "%s | Wassana Thai Imbiss Landshut",
  },
  description:
    "Thai Imbiss in Landshut am Regierungsplatz: authentische Curries, Wok-Gerichte & Suppen. Mo–Fr 11–18 Uhr. Catering & Kochkurs. Jetzt Speisekarte ansehen.",
  keywords: [...site.seo.keywords],
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "restaurant",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.seo.locale,
    url: siteUrl,
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
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "geo.region": "DE-BY",
    "geo.placename": "Landshut",
    "geo.position": `${site.geo.latitude};${site.geo.longitude}`,
    ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="de">
      <body className={`${typewriter.variable} antialiased`}>
        <JsonLdLocalBusiness />
        <JsonLdWebSite />
        <PublicChrome content={content}>{children}</PublicChrome>
      </body>
    </html>
  );
}
