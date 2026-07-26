"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  CONSENT_CATEGORIES,
  createConsent,
  persistConsent,
  readStoredConsent,
  type ConsentState,
} from "@/lib/consent";

type Mode = "first" | "settings";

export function CookieBanner() {
  const titleId = useId();
  const textId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("first");
  const [maps, setMaps] = useState(false);
  const [ready, setReady] = useState(false);

  const closePanel = useCallback(() => {
    document.documentElement.classList.remove("has-cookie-banner");
    setOpen(false);
  }, []);

  const openPanel = useCallback((nextMode: Mode, existing: ConsentState | null) => {
    setMode(nextMode);
    setMaps(Boolean(existing?.maps));
    document.documentElement.classList.add("has-cookie-banner");
    setOpen(true);
  }, []);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) {
      openPanel("first", null);
    }
    setReady(true);

    function onOpenSettings() {
      const current = readStoredConsent();
      openPanel("settings", current);
    }
    window.addEventListener("wassana-open-consent", onOpenSettings);
    return () => {
      window.removeEventListener("wassana-open-consent", onOpenSettings);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    if (mode === "settings" || mode === "first") {
      document.body.style.overflow = "hidden";
    }

    const focusTimer = window.setTimeout(() => {
      firstFocusRef.current?.focus();
    }, 30);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && mode === "settings") {
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, mode, closePanel]);

  function save(nextMaps: boolean) {
    persistConsent(createConsent(nextMaps));
    closePanel();
  }

  if (!ready || !open) return null;

  return (
    <div className="cookie-root" role="presentation">
      <button
        type="button"
        className="cookie-backdrop"
        aria-label={
          mode === "settings"
            ? "Cookie-Einstellungen schließen"
            : "Cookie-Hinweis im Vordergrund"
        }
        tabIndex={mode === "settings" ? 0 : -1}
        onClick={() => {
          if (mode === "settings") closePanel();
        }}
      />

      <div
        ref={panelRef}
        className="cookie-banner"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
      >
        <div className="cookie-banner-sheet">
          <div className="cookie-banner-handle" aria-hidden />

          <div className="cookie-banner-head">
            <p id={titleId} className="cookie-banner-kicker">
              Cookies & Datenschutz
            </p>
            <h2 className="cookie-banner-title">
              {mode === "settings"
                ? "Ihre Einwilligung anpassen"
                : "Damit alles datenschutzkonform läuft"}
            </h2>
            <p id={textId} className="cookie-banner-lead">
              Keine Tracking- oder Werbe-Cookies. Notwendige Einstellungen
              speichern wir lokal. Google Maps laden wir nur mit Ihrer
              Zustimmung. Details in der{" "}
              <Link href="/datenschutz">Datenschutzerklärung</Link> und im{" "}
              <Link href="/impressum">Impressum</Link>.
            </p>
          </div>

          <ul className="cookie-category-list">
            {CONSENT_CATEGORIES.map((category) => {
              const checked =
                category.id === "necessary" ? true : maps;
              const disabled = category.required;
              return (
                <li key={category.id} className="cookie-category">
                  <div className="cookie-category-copy">
                    <p className="cookie-category-title">
                      {category.title}
                      {category.required ? (
                        <span className="cookie-category-badge">immer aktiv</span>
                      ) : null}
                    </p>
                    <p className="cookie-category-text">{category.description}</p>
                  </div>
                  <label className="cookie-switch">
                    <span className="sr-only">
                      {category.title}
                      {disabled ? " (immer aktiv)" : ""}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => {
                        if (category.id === "maps") {
                          setMaps(event.target.checked);
                        }
                      }}
                    />
                    <span className="cookie-switch-ui" aria-hidden />
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="cookie-banner-actions">
            <button
              ref={firstFocusRef}
              type="button"
              className="cookie-btn cookie-btn--ghost"
              onClick={() => save(false)}
            >
              Nur notwendige
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn--outline"
              onClick={() => save(maps)}
            >
              Auswahl speichern
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn--primary"
              onClick={() => save(true)}
            >
              Alle akzeptieren
            </button>
          </div>

          {mode === "settings" ? (
            <p className="cookie-banner-footnote">
              Änderungen gelten ab jetzt. Maps wird ohne Zustimmung nicht
              geladen.
            </p>
          ) : (
            <p className="cookie-banner-footnote">
              Später jederzeit unter „Cookies“ im Footer ändern.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
