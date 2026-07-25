import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description:
    "Diese Seite gibt es bei Wassana Thai Imbiss Landshut nicht — zurück zur Speisekarte, Anfahrt oder Startseite.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-3xl flex-col justify-center px-5 py-24 md:px-8">
      <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
        404 · Landshut
      </p>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
        Seite nicht gefunden
      </h1>
      <p className="mt-5 max-w-md text-lg text-[color:var(--muted)] leading-relaxed">
        Die gewünschte Adresse existiert nicht. Hier geht’s weiter zu den
        wichtigsten Seiten von Wassana Thai Imbiss.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Zur Startseite
        </Link>
        <Link href="/speisekarte" className="btn-gold">
          Speisekarte
        </Link>
        <Link href="/anfahrt" className="btn-gold">
          Anfahrt
        </Link>
        <Link href="/kontakt" className="btn-gold">
          Kontakt
        </Link>
      </div>
    </main>
  );
}
