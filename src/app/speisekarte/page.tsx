import type { Metadata } from "next";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { SpeisekarteFull } from "@/components/Speisekarte";

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
      <div className="border-b border-[color:var(--line)] bg-[color:var(--paper)]">
        <div className="mx-auto max-w-3xl px-5 py-10 text-center md:px-8">
          <Reveal>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Wochenkarte und Klassiker — schauen Sie, was heute bei Wassana auf
              dem Herd steht.
            </p>
          </Reveal>
        </div>
      </div>
      <SpeisekarteFull />
    </main>
  );
}
