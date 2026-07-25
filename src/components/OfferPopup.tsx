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
  const dragY = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const exitingRef = useRef(false);
  const [offsetY, setOffsetY] = useState(0);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const bullets = bulletList(offer.popupBullets);

  const requestClose = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setEntered(false);
    setIsDragging(false);
    window.setTimeout(() => {
      closeOffer();
      exitingRef.current = false;
      setExiting(false);
      setOffsetY(0);
    }, 280);
  }, [closeOffer]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      setExiting(false);
      exitingRef.current = false;
      setOffsetY(0);
      setIsDragging(false);
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

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    dragging.current = true;
    setIsDragging(true);
    startY.current = event.clientY;
    dragY.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const delta = Math.max(0, event.clientY - startY.current);
    dragY.current = delta;
    setOffsetY(delta);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    if (dragY.current > 110) {
      requestClose();
      return;
    }
    setOffsetY(0);
  }

  if (!open && !exiting) return null;

  const price = offer.popupPrice.trim() || offer.price;
  const note = offer.popupNote.trim() || offer.note;
  const title = offer.popupTitle.trim() || offer.title;
  const lead = offer.popupLead.trim() || offer.text;
  const ctaHref = offer.popupCtaHref.trim() || "/speisekarte#wochenkarte";
  const ctaLabel = offer.popupCtaLabel.trim() || "Zur Wochenkarte";

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
        style={
          offsetY || isDragging
            ? {
                transform: `translateY(${offsetY}px)`,
                transition: isDragging ? "none" : undefined,
              }
            : undefined
        }
      >
        <div
          className="offer-popup-handle-zone"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="offer-popup-handle" aria-hidden />
          <button
            type="button"
            className="offer-popup-close"
            aria-label="Schließen"
            onClick={requestClose}
          >
            ×
          </button>
        </div>

        <div className="offer-popup-body">
          <p className="offer-popup-eyebrow">{offer.eyebrow}</p>
          <h2 id={titleId} className="offer-popup-title">
            {title}
          </h2>
          {lead ? <p className="offer-popup-lead">{lead}</p> : null}
          <div className="gold-rule mt-5 max-w-[12rem]" />

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

          {price ? <p className="offer-popup-price">{price}</p> : null}
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
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
