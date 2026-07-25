"use client";

import { Reveal } from "@/components/Reveal";
import { useOfferPopupOptional } from "@/components/OfferPopupContext";
import type { SiteContent } from "@/lib/site-content-shared";

type StudentLunchProps = {
  compact?: boolean;
  offer: SiteContent["studentLunch"];
};

export function StudentLunch({ compact = false, offer }: StudentLunchProps) {
  const offerPopup = useOfferPopupOptional();

  if (compact) {
    return (
      <aside
        aria-label={offer.eyebrow}
        className="feature-band student-lunch-band border-y border-[color:var(--line)]"
      >
        <button
          type="button"
          className="student-lunch-compact"
          onClick={() => offerPopup?.openOffer()}
        >
          <span className="student-lunch-compact-eyebrow">{offer.eyebrow}</span>
          <span className="student-lunch-compact-copy">
            <span className="student-lunch-compact-text">{offer.text}</span>
            <span className="student-lunch-compact-price">{offer.price}</span>
            <span className="student-lunch-compact-note">{offer.note}</span>
            <span className="student-lunch-compact-cta">
              Mehr erfahren
              <span aria-hidden> →</span>
            </span>
          </span>
        </button>
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn-primary inline-flex"
              onClick={() => offerPopup?.openOffer()}
            >
              Mehr erfahren
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
