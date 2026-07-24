import type { Metadata } from "next";
import { SpeisekarteFull } from "@/components/Speisekarte";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Speisekarte",
  description:
    "Wochenkarte und Speisekarte von Wassana Thai Imbiss in Landshut.",
};

export default function SpeisekartePage() {
  return (
    <main className="pt-24">
      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Speisekarte
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Unsere Gerichte
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[color:var(--muted)]">
            Frisch zubereitet — Currys, Wok, Suppen und mehr. Gerne auch zum
            Mitnehmen.
          </p>
        </Reveal>
      </div>
      <SpeisekarteFull />
    </main>
  );
}
