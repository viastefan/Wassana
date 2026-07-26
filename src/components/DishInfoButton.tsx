"use client";

import { useEffect, useId, useRef, useState } from "react";
import { allergens } from "@/lib/menu";
import {
  dayHasExtraInfo,
  type WeeklyMenuDay,
} from "@/lib/weekly-menu-store-shared";

function resolveAllergenLabels(codes?: string) {
  const parts = String(codes || "")
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return [];
  return parts.map((code) => {
    const match = allergens.find(
      (item) => item.code.toLowerCase() === code.toLowerCase(),
    );
    return {
      code,
      label: match?.label || "siehe Kennzeichnung",
    };
  });
}

export function DishInfoButton({ day }: { day: WeeklyMenuDay }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasInfo = dayHasExtraInfo(day);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!hasInfo) return null;

  const allergenRows = resolveAllergenLabels(day.allergens);
  const nutrition = [
    { label: "kcal", value: day.kcal },
    { label: "Eiweiß", value: day.protein },
    { label: "Fett", value: day.fat },
    { label: "Kohlenhydrate", value: day.carbs },
  ].filter((row) => Boolean(row.value?.trim()));

  return (
    <>
      <button
        type="button"
        className="dish-info-btn"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Info zu ${day.dish}`}
        title="Info zu Allergien & Nährwerten"
      >
        i
      </button>

      {open ? (
        <div
          className="allergen-dialog-root"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="allergen-dialog dish-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="allergen-dialog-top">
              <div>
                <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                  {day.day}
                </p>
                <h2
                  id={titleId}
                  className="font-display mt-1 text-2xl text-[color:var(--red)]"
                >
                  {day.dish}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="allergen-dialog-close"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            {day.description ? (
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                {day.description}
              </p>
            ) : null}

            {day.info ? (
              <div className="dish-info-block">
                <p className="dish-info-block-label">Hinweise</p>
                <p className="dish-info-block-text">{day.info}</p>
              </div>
            ) : null}

            {allergenRows.length ? (
              <div className="dish-info-block">
                <p className="dish-info-block-label">Allergene / Kennzeichnung</p>
                <ul className="allergen-dialog-list">
                  {allergenRows.map((row) => (
                    <li key={row.code}>
                      <span className="allergen-code">{row.code}</span>
                      <span>{row.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {nutrition.length ? (
              <div className="dish-info-block">
                <p className="dish-info-block-label">Nährwerte</p>
                <p className="dish-info-note">
                  Ungefähre Angaben — je nach Variante und Beilage.
                </p>
                <dl className="dish-nutrition-grid">
                  {nutrition.map((row) => (
                    <div key={row.label} className="dish-nutrition-item">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {day.items.length ? (
              <div className="dish-info-block">
                <p className="dish-info-block-label">Varianten</p>
                <ul className="dish-variant-list">
                  {day.items.map((item) => (
                    <li key={`${item.nr}-${item.name}`}>
                      <span>
                        <span className="text-[color:var(--gold)]">
                          {item.nr}
                        </span>{" "}
                        {item.name}
                      </span>
                      <span className="text-[color:var(--red)]">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={() => setOpen(false)}
            >
              Schließen
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
