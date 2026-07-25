/** Support contact + diagnostic helpers for the Admin publish flow. */

export const SUPPORT_EMAIL = "stefandirnberger@viawen.com";
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

export type PersistSnapshot = {
  disk?: boolean;
  tmp?: boolean;
  blob?: boolean;
  github?: boolean;
  durable?: boolean;
};

export type DiagnosticReport = {
  createdAt: string;
  action: string;
  ok: boolean;
  summary: string;
  details: string[];
  persist?: PersistSnapshot;
  env: {
    vercel: boolean;
    githubToken: boolean;
    githubRepo: boolean;
    smtp: boolean;
    blob: boolean;
    siteUrl: string;
  };
};

export function buildSupportMailto(report: DiagnosticReport) {
  const subject = encodeURIComponent(
    `[Wassana Admin] ${report.ok ? "Hinweis" : "Fehler"}: ${report.action}`,
  );
  const body = encodeURIComponent(formatDiagnosticReport(report));
  return `${SUPPORT_MAILTO}?subject=${subject}&body=${body}`;
}

export function formatDiagnosticReport(report: DiagnosticReport): string {
  const lines = [
    "Wassana Admin — Statusbericht",
    `Zeit: ${report.createdAt}`,
    `Aktion: ${report.action}`,
    `Ergebnis: ${report.ok ? "OK" : "FEHLER"}`,
    "",
    report.summary,
    "",
    "Details:",
    ...report.details.map((line) => `- ${line}`),
    "",
    "Umgebung:",
    `- Blob: ${report.env.blob ? "gesetzt" : "FEHLT"}`,
    `- GITHUB_TOKEN: ${report.env.githubToken ? "gesetzt (optional Backup)" : "fehlt (optional)"}`,
    `- GITHUB_REPO: ${report.env.githubRepo ? "gesetzt/ableitbar" : "unklar"}`,
    `- SMTP: ${report.env.smtp ? "gesetzt" : "fehlt"}`,
    `- Site-URL: ${report.env.siteUrl}`,
  ];

  if (report.persist) {
    lines.push(
      "",
      "Persistenz:",
      `- Blob: ${yesNo(report.persist.blob)}`,
      `- Disk: ${yesNo(report.persist.disk)}`,
      `- /tmp: ${yesNo(report.persist.tmp)}`,
      `- GitHub: ${yesNo(report.persist.github)}`,
      `- Dauerhaft: ${yesNo(report.persist.durable)}`,
    );
  }

  lines.push(
    "",
    "Bitte Support kontaktieren:",
    SUPPORT_EMAIL,
  );

  return lines.join("\n");
}

function yesNo(value: boolean | undefined) {
  if (value === true) return "ja";
  if (value === false) return "nein";
  return "—";
}

export function envDiagnostics(): DiagnosticReport["env"] {
  // Browser bundle cannot read secret env vars — use public fallbacks only.
  if (typeof window !== "undefined") {
    return {
      vercel: true,
      githubToken: false,
      githubRepo: false,
      smtp: false,
      blob: false,
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        "https://www.wassana-thai-imbiss.de",
    };
  }

  const repo =
    process.env.GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");

  return {
    vercel: Boolean(process.env.VERCEL || process.env.VERCEL_ENV),
    githubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
    githubRepo: Boolean(repo),
    smtp: Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
    ),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://www.wassana-thai-imbiss.de",
  };
}

export function buildPublishDiagnostic(input: {
  action: string;
  ok: boolean;
  error?: string;
  persist?: PersistSnapshot;
  env?: DiagnosticReport["env"];
}): DiagnosticReport {
  const env = input.env || envDiagnostics();
  const details: string[] = [];

  if (input.error) details.push(input.error);

  if (input.persist) {
    if (input.persist.blob) {
      details.push(
        "In Vercel Blob gespeichert — Website liest die Änderung sofort (ohne Redeploy).",
      );
    }
    if (!input.persist.blob && !input.persist.github && env.vercel) {
      details.push(
        "Weder Blob noch GitHub haben gespeichert — Live-Update auf .de ist blockiert.",
      );
    }
    if (input.persist.tmp && !input.persist.durable) {
      details.push(
        "Nur in /tmp gespeichert (temporär, verschwindet bei neuem Deploy).",
      );
    }
    if (input.persist.github) {
      details.push("Zusätzlich als GitHub-Backup committed.");
    }
  }

  if (!env.blob && env.vercel) {
    details.push(
      "KRITISCH: BLOB_READ_WRITE_TOKEN fehlt in Vercel → Admin-Änderungen kommen nicht dauerhaft live.",
    );
  }
  if (!env.smtp) {
    details.push(
      "SMTP_* fehlt — automatische Support-/Reset-Mails sind deaktiviert (mailto funktioniert trotzdem).",
    );
  }

  if (details.length === 0) {
    details.push(
      input.ok
        ? "Speichern und Veröffentlichung ohne Beanstandung."
        : "Unbekannter Fehler — bitte Support mit diesem Bericht kontaktieren.",
    );
  }

  const summary = input.ok
    ? "Veröffentlichung erfolgreich."
    : input.error ||
      (!env.blob
        ? "Nicht live: BLOB_READ_WRITE_TOKEN fehlt auf Vercel."
        : "Veröffentlichung fehlgeschlagen.");

  return {
    createdAt: new Date().toISOString(),
    action: input.action,
    ok: input.ok,
    summary,
    details,
    persist: input.persist,
    env,
  };
}
