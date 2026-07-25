"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useOfferPopup } from "@/components/OfferPopupContext";

function bulletList(raw: string) {
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function OfferPopup() {
  const { open, closeOffer, offer } = useOfferPopup();
  const titleId = useId();
  const exitingRef = useRef(false);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  const bullets = bulletList(offer.popupBullets);

  const requestClose = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setEntered(false);
    window.setTimeout(() => {
      closeOffer();
      exitingRef.current = false;
      setExiting(false);
    }, 280);
  }, [closeOffer]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      setExiting(false);
      exitingRef.current = false;
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = window.requestAnimationFrame(() => setEntered(true));

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, requestClose]);

  if (!open && !exiting) return null;

  const price = offer.popupPrice.trim() || offer.price;
  const note = offer.popupNote.trim() || offer.note;
  const title = offer.popupTitle.trim() || offer.title;
  const lead = offer.popupLead.trim() || offer.text;
  const ctaHref = offer.popupCtaHref.trim() || "/speisekarte#wochenkarte";
  const ctaLabel = offer.popupCtaLabel.trim() || "Beliebte Gerichte";

  return (
    <div
      className={`offer-popup ${entered && !exiting ? "is-open" : ""}`}
      role="presentation"
    >
      <button
        type="button"
        className="offer-popup-backdrop"
        aria-label="Angebot schließen"
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="offer-popup-sheet"
      >
        <div className="offer-popup-accent" aria-hidden />

        <button
          type="button"
          className="offer-popup-close"
          aria-label="Schließen"
          onClick={requestClose}
        >
          ×
        </button>

        <div className="offer-popup-body">
          <p className="offer-popup-eyebrow">{offer.eyebrow}</p>
          <h2 id={titleId} className="offer-popup-title">
            {title}
          </h2>
          {lead ? <p className="offer-popup-lead">{lead}</p> : null}

          {price ? (
            <p className="offer-popup-price-badge">
              <span className="offer-popup-price-label">Angebot</span>
              <span className="offer-popup-price">{price}</span>
            </p>
          ) : null}

          {offer.popupBody.trim() ? (
            <p className="offer-popup-copy">{offer.popupBody}</p>
          ) : null}

          {bullets.length ? (
            <ul className="offer-popup-list">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {note ? <p className="offer-popup-note">{note}</p> : null}

          <div className="offer-popup-actions">
            <Link
              href={ctaHref}
              className="btn-primary offer-popup-cta"
              onClick={requestClose}
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
              className="btn-gold offer-popup-cta"
              onClick={requestClose}
            >
              Später
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
