import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Wassana Verwaltung",
  },
  description: "Nur für den Inhaber: Speisekarte, Angebote und Anfragen live steuern.",
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
  themeColor: "#f2f2f7",
  userScalable: false,
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
  return <div className="admin-app">{children}</div>;
}
