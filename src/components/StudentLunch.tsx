"use client";

import { EditableText } from "@/components/EditableText";
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
          data-admin-open-offer=""
          onClick={() => offerPopup?.openOffer()}
        >
          <EditableText
            path="studentLunch.eyebrow"
            as="span"
            className="student-lunch-compact-eyebrow"
          >
            {offer.eyebrow}
          </EditableText>
          <span className="student-lunch-compact-copy">
            <EditableText
              path="studentLunch.text"
              as="span"
              className="student-lunch-compact-text"
            >
              {offer.text}
            </EditableText>
            <EditableText
              path="studentLunch.price"
              as="span"
              className="student-lunch-compact-price"
            >
              {offer.price}
            </EditableText>
            <EditableText
              path="studentLunch.note"
              as="span"
              className="student-lunch-compact-note"
            >
              {offer.note}
            </EditableText>
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
          <EditableText
            path="studentLunch.eyebrow"
            as="p"
            className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase"
          >
            {offer.eyebrow}
          </EditableText>
          <EditableText
            path="studentLunch.title"
            as="h2"
            id="schueler-mittag-heading"
            className="font-display mt-4 text-3xl text-[color:var(--red)] md:text-4xl"
          >
            {offer.title}
          </EditableText>
          <div className="gold-rule mx-auto mt-6 max-w-xs" />
          <EditableText
            path="studentLunch.text"
            as="p"
            className="mt-6 text-lg leading-relaxed text-[color:var(--ink)]"
          >
            {offer.text}
          </EditableText>
          <EditableText
            path="studentLunch.price"
            as="p"
            className="font-display mt-5 text-2xl text-[color:var(--red)]"
          >
            {offer.price}
          </EditableText>
          <EditableText
            path="studentLunch.note"
            as="p"
            className="mt-3 text-sm text-[color:var(--muted)]"
          >
            {offer.note}
          </EditableText>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn-primary inline-flex"
              data-admin-open-offer=""
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
