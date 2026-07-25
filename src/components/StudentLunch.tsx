import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import type { SiteContent } from "@/lib/site-content";

type StudentLunchProps = {
  compact?: boolean;
  offer: SiteContent["studentLunch"];
};

export function StudentLunch({ compact = false, offer }: StudentLunchProps) {
  if (compact) {
    return (
      <aside
        aria-label={offer.eyebrow}
        className="feature-band border-y border-[color:var(--line)]"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 md:flex-row md:items-baseline md:justify-between md:gap-8 md:px-8">
          <p className="text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
            {offer.eyebrow}
          </p>
          <p className="text-[color:var(--ink)] leading-relaxed md:max-w-xl">
            {offer.text}{" "}
            <span className="whitespace-nowrap text-[color:var(--red)]">
              {offer.price}
            </span>
            <span className="mt-1 block text-sm text-[color:var(--muted)]">
              {offer.note}
            </span>
          </p>
        </div>
      </aside>
    );
  }

  return (
    <section
      aria-labelledby="schueler-mittag-heading"
      className="feature-band border-y border-[color:var(--line)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-14 text-center md:px-8 md:py-16">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            {offer.eyebrow}
          </p>
          <h2
            id="schueler-mittag-heading"
            className="font-display mt-4 text-3xl text-[color:var(--red)] md:text-4xl"
          >
            {offer.title}
          </h2>
          <div className="gold-rule mx-auto mt-6 max-w-xs" />
          <p className="mt-6 text-lg leading-relaxed text-[color:var(--ink)]">
            {offer.text}
          </p>
          <p className="font-display mt-5 text-2xl text-[color:var(--red)]">
            {offer.price}
          </p>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{offer.note}</p>
          <Link
            href="/speisekarte#wochenkarte"
            className="btn-primary mt-8 inline-flex"
          >
            Zur Wochenkarte
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
