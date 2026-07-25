"use client";

import type { ReactNode } from "react";

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
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">{title}</h2>
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

export function StickySave({
  saving,
  label,
  disabled,
  phase = "idle",
}: {
  saving: boolean;
  label: string;
  disabled?: boolean;
  phase?: PublishPhase;
}) {
  const busy = saving || phase === "publishing";
  const text =
    phase === "publishing"
      ? "Veröffentlichen …"
      : phase === "online"
        ? "Online — live"
        : phase === "error"
          ? "Fehler — siehe Hinweis"
          : busy
            ? "Speichern …"
            : label;

  return (
    <div className="admin-sticky-save">
      <button
        type="submit"
        className={`btn-primary admin-sticky-save-btn ${
          phase === "online" ? "is-online" : ""
        } ${phase === "error" ? "is-error" : ""}`}
        disabled={busy || disabled || phase === "online"}
      >
        {text}
      </button>
    </div>
  );
}
