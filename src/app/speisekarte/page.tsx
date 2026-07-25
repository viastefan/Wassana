import type { Metadata } from "next";
import { MediaBand } from "@/components/Media";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { StudentLunch } from "@/components/StudentLunch";

export const metadata: Metadata = {
  title: "Speisekarte Thai Imbiss Landshut",
  description:
    "Speisekarte von Wassana in Landshut: Wochenkarte, Curries, Wok, Suppen, vegetarisch & Getränke. Frisch zubereitet, gerne zum Mitnehmen.",
  alternates: { canonical: "/speisekarte" },
  openGraph: {
    title: "Speisekarte | Wassana Thai Imbiss Landshut",
    description:
      "Wochenkarte und alle Gerichte — Thai Essen in Landshut am Regierungsplatz.",
    url: "/speisekarte",
  },
};

export default function SpeisekartePage() {
  return (
    <main>
      <MediaBand
        src="/images/curry.jpg"
        alt="Curry-Gerichte auf der Speisekarte bei Wassana"
        eyebrow="Speisekarte Landshut"
        title="Unsere Gerichte"
        text="Frisch zubereitet in Landshut — Currys, Wok, Suppen und mehr. Gerne auch zum Mitnehmen."
        priority
        height="short"
      />
      <StudentLunch compact />
      <SpeisekarteFull />
    </main>
  );
}
