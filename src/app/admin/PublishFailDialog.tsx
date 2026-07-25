"use client";

import type { DiagnosticReport } from "@/lib/admin-support";
import { SUPPORT_EMAIL, buildSupportMailto } from "@/lib/admin-support";

export function PublishFailDialog({
  report,
  onClose,
}: {
  report: DiagnosticReport;
  onClose: () => void;
}) {
  const mailto = buildSupportMailto(report);
  const text = [
    report.summary,
    "",
    ...report.details.map((line) => `• ${line}`),
  ].join("\n");

  async function requestPasswordReset() {
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          report: text,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        message?: string;
        resetUrl?: string;
        mailed?: boolean;
      } | null;
      if (data?.resetUrl && !data.mailed) {
        window.open(
          buildSupportMailto({
            ...report,
            summary: `${report.summary}\n\nReset-Link:\n${data.resetUrl}`,
            details: [
              ...report.details,
              `Reset-Link: ${data.resetUrl}`,
              data.message || "",
            ],
          }),
          "_blank",
        );
        return;
      }
      window.alert(
        data?.message ||
          `Reset angefordert. Prüfe ${SUPPORT_EMAIL} bzw. den Mailto-Dialog.`,
      );
    } catch {
      window.open(mailto, "_blank");
    }
  }

  async function sendSupportMail() {
    try {
      const res = await fetch("/api/admin/support-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `[Wassana Admin] Fehler: ${report.action}`,
          report: text,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        mailed?: boolean;
        message?: string;
      } | null;
      if (!data?.mailed) {
        window.open(mailto, "_blank");
        return;
      }
      window.alert(data.message || "Bericht gesendet.");
    } catch {
      window.open(mailto, "_blank");
    }
  }

  return (
    <div className="admin-fail-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-fail-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-fail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="admin-kicker !text-[color:var(--admin-gold-soft)]">
          Veröffentlichung
        </p>
        <h2
          id="admin-fail-title"
          className="mt-2 font-display text-2xl text-white"
        >
          Nicht online
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85">
          {report.summary}
        </p>
        <ul className="admin-fail-list">
          {report.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={mailto} className="admin-install-cta">
            Support kontaktieren
          </a>
          <button
            type="button"
            className="btn-gold !border-white/30 !text-white !bg-white/10"
            onClick={() => void sendSupportMail()}
          >
            Bericht senden
          </button>
          <button
            type="button"
            className="btn-gold !border-white/30 !text-white !bg-white/10"
            onClick={() => void requestPasswordReset()}
          >
            Neues Passwort
          </button>
          <button
            type="button"
            className="btn-gold !border-white/30 !text-white !bg-transparent"
            onClick={onClose}
          >
            Schließen
          </button>
        </div>
        <p className="mt-4 text-xs text-white/60">{SUPPORT_EMAIL}</p>
      </div>
    </div>
  );
}
