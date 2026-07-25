import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schüler Mittagessen Landshut",
  description:
    "Schüler- und Azubi-Mittagessen bei Wassana in Landshut — Details im Angebot-Popup.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

/** Legacy URL — Angebot läuft nur noch über das Popup. */
export default function SchuelerMittagessenRedirectPage() {
  redirect("/?mittag=1");
}
