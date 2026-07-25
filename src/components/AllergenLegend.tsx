"use client";

import { useEffect, useId, useRef, useState } from "react";
import { allergens } from "@/lib/menu";

type Props = {
  /** Compact chip-style trigger for sticky menu bar */
  variant?: "chip" | "button" | "link" | "fab";
  className?: string;
};

function AllergenDialog({
  open,
  onClose,
  titleId,
  closeRef,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, closeRef]);

  if (!open) return null;

  return (
    <div
      className="allergen-dialog-root"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="allergen-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="allergen-dialog-handle" aria-hidden />
        <div className="allergen-dialog-top">
          <div>
            <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
              Speisekarte
            </p>
            <h2
              id={titleId}
              className="font-display mt-1 text-2xl text-[color:var(--red)]"
            >
              Kennzeichnung
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="allergen-dialog-close"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
          Hochgestellte Buchstaben und Zahlen neben den Gerichten zeigen
          Zusatzstoffe und Allergene — wie auf klassischen Speisekarten.
        </p>

        <ul className="allergen-dialog-list">
          {allergens.map((item) => (
            <li key={item.code}>
              <span className="allergen-code">{item.code}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-[color:var(--muted)]">
          Schärfe nach Wunsch: nicht scharf – leicht scharf – mittelscharf –
          scharf – sehr scharf. Extra Soße 0,10 €. Getränke mit * inkl. 0,15 €
          Pfand.
        </p>

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={onClose}
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}

export function AllergenLegend({ variant = "button", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  if (variant === "fab") {
    return (
      <>
        <button
          type="button"
          className={`allergen-fab ${className}`}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Kennzeichnung öffnen — Allergene A B C"
        >
          <span className="allergen-fab-badge" aria-hidden>
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </span>
          <span className="allergen-fab-copy">
            <span className="allergen-fab-kicker">Legende</span>
            <span className="allergen-fab-title">Kennzeichnung</span>
          </span>
        </button>
        <AllergenDialog
          open={open}
          onClose={() => setOpen(false)}
          titleId={titleId}
          closeRef={closeRef}
        />
      </>
    );
  }

  const triggerClass =
    variant === "chip"
      ? `chip ${className}`
      : variant === "link"
        ? `text-sm text-[color:var(--red)] underline-offset-2 hover:underline ${className}`
        : `btn-gold !px-3 !py-2 text-sm ${className}`;

  return (
    <>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Kennzeichnung
      </button>
      <AllergenDialog
        open={open}
        onClose={() => setOpen(false)}
        titleId={titleId}
        closeRef={closeRef}
      />
    </>
  );
}

/** Superscript allergen marks next to a dish name. */
export function AllergenMarks({ codes }: { codes?: string }) {
  const cleaned = String(codes || "")
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!cleaned.length) return null;
  return (
    <sup className="allergen-marks" title={`Kennzeichnung: ${cleaned.join(", ")}`}>
      {cleaned.join(",")}
    </sup>
  );
}
