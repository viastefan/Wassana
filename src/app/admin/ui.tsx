"use client";

import type { ReactNode } from "react";
import type { PersistSnapshot } from "@/lib/admin-support";

export function ScreenHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-screen-header">
      <div className="min-w-0 flex-1">
        <p className="admin-kicker">{kicker}</p>
        <h1 className="admin-screen-title">{title}</h1>
        {description ? (
          <p className="admin-screen-desc">{description}</p>
        ) : null}
      </div>
      {action ? <div className="admin-screen-action">{action}</div> : null}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <h2 className="admin-section-title">{title}</h2>
        {action ? <div className="admin-section-action">{action}</div> : null}
      </div>
      <div className="admin-section-body">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="admin-field-wrap">
      <span className="admin-field-label">{label}</span>
      {children}
      {hint ? <span className="admin-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`admin-switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="admin-switch-copy">
        <span className="admin-switch-label">{label}</span>
        {hint ? <span className="admin-switch-hint">{hint}</span> : null}
      </span>
      <span className="admin-switch-track" aria-hidden>
        <span className="admin-switch-thumb" />
      </span>
    </button>
  );
}

export type PublishPhase = "idle" | "publishing" | "online" | "error";

export function PersistChips({
  persist,
  compact = false,
}: {
  persist?: PersistSnapshot | null;
  compact?: boolean;
}) {
  if (!persist) return null;
  const items = [
    { key: "blob", label: "Live-Speicher", ok: persist.blob },
    { key: "github", label: "Backup", ok: persist.github },
    { key: "durable", label: "Dauerhaft", ok: persist.durable },
  ] as const;

  const allOk = items.every((item) => item.ok === true);
  const anyBad = items.some((item) => item.ok === false);

  return (
    <div
      className={compact ? "admin-persist-chips" : "admin-persist-rail"}
      aria-label="Speicher-Status"
    >
      {!compact ? (
        <p className="admin-persist-rail-label">
          {allOk
            ? "Backend synchron — Website liest frische Daten"
            : anyBad
              ? "Speicher prüfen — Veröffentlichung kann fehlschlagen"
              : "Speicher-Status"}
        </p>
      ) : null}
      <div className="admin-persist-chips">
        {items.map((item) => (
          <span
            key={item.key}
            className={`admin-persist-chip ${
              item.ok === true
                ? "is-ok"
                : item.ok === false
                  ? "is-bad"
                  : "is-unknown"
            }`}
            title={
              item.ok === true
                ? `${item.label}: OK`
                : item.ok === false
                  ? `${item.label}: fehlt / Fehler`
                  : `${item.label}: unbekannt`
            }
          >
            <span className="admin-persist-dot" aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatusDot({
  tone = "neutral",
}: {
  tone?: "ok" | "warn" | "bad" | "neutral";
}) {
  return <span className={`admin-status-dot is-${tone}`} aria-hidden />;
}

export function StickySave({
  saving,
  label,
  disabled,
  phase = "idle",
  hint = "Speichert dauerhaft und geht sofort live auf der Website.",
}: {
  saving: boolean;
  label: string;
  disabled?: boolean;
  phase?: PublishPhase;
  hint?: string;
}) {
  const busy = saving || phase === "publishing";
  const text =
    phase === "publishing"
      ? "Wird live geschaltet …"
      : phase === "online"
        ? "Live auf der Website"
        : phase === "error"
          ? "Nicht live — Fehler"
          : busy
            ? "Wird veröffentlicht …"
            : label;

  return (
    <div className="admin-sticky-save">
      {phase === "idle" && !busy ? (
        <p className="admin-sticky-hint">{hint}</p>
      ) : null}
      {phase === "online" ? (
        <p className="admin-sticky-hint admin-sticky-hint-ok">
          Gespeichert — Website zeigt die neue Version.
        </p>
      ) : null}
      {phase === "error" ? (
        <p className="admin-sticky-hint admin-sticky-hint-bad">
          Nicht online. Details im Fehlerdialog prüfen.
        </p>
      ) : null}
      <button
        type="submit"
        className={`btn-primary admin-sticky-save-btn ${
          phase === "publishing" || busy ? "is-loading" : ""
        } ${phase === "online" ? "is-online" : ""} ${
          phase === "error" ? "is-error" : ""
        }`}
        disabled={busy || disabled || phase === "online"}
      >
        <span
          className={`admin-sticky-save-fill ${
            phase === "publishing" || busy ? "is-active" : ""
          }`}
          aria-hidden
        />
        <span className="admin-sticky-save-label">{text}</span>
      </button>
    </div>
  );
}
