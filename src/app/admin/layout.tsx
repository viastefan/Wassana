import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Site Manager",
  },
  description: "Website-Manager: Speisekarte, Angebote und Anfragen — nur Inhaber.",
  robots: { index: false, follow: false },
  applicationName: "Site Manager",
  icons: {
    icon: [
      { url: "/admin/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e2129",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-app">{children}</div>;
}
