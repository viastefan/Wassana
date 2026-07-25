import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Wassana Verwaltung",
  },
  description: "Kochkurs, Anfragen und Website-Inhalte verwalten.",
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  applicationName: "Wassana Verwaltung",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
  themeColor: "#7a0c24",
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
