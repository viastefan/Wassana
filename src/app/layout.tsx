import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wassana — Thai-Kochkurse",
  description:
    "Authentische Thai-Kochkurse mit Wassana: Warenkunde, Rezepte und sechs Gerichte zum gemeinsamen Kochen und Genießen.",
  openGraph: {
    title: "Wassana — Thai-Kochkurse",
    description:
      "Modern, schlicht und nah am Geschmack: Thai-Kochkurse, Privatkurse und Catering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
