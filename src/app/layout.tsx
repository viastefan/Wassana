import type { Metadata } from "next";
import { Special_Elite } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

/* Schreibmaschinen-Stil in Richtung „Gabriele“ */
const typewriter = Special_Elite({
  variable: "--font-typewriter",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wassana Thai Imbiss · Landshut",
    template: "%s · Wassana",
  },
  description:
    "Wassana Thai Imbiss im Gewerbehaus am Regierungsplatz in Landshut — authentische Curries, Wok-Gerichte, Suppen, Catering und Kochkurse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${typewriter.variable} antialiased`}>
        <div className="site-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
