import type { Metadata, Viewport } from "next";
import { Manrope, Special_Elite } from "next/font/google";

const adminSans = Manrope({
  variable: "--font-admin-sans",
  subsets: ["latin"],
  display: "swap",
});

const adminDisplay = Special_Elite({
  variable: "--font-admin-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "Wassana Verwaltung",
  },
  description: "Kochkurs, Anfragen und Website-Inhalte — speichern heißt live.",
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  applicationName: "Wassana Verwaltung",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wassana",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/admin/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eee4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`admin-app ${adminSans.variable} ${adminDisplay.variable}`}
    >
      {children}
    </div>
  );
}
