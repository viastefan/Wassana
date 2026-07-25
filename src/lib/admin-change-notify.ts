import { SUPPORT_EMAIL } from "@/lib/admin-support";
import { isMailConfigured, sendMail } from "@/lib/mail";
import type { PersistResult } from "@/lib/persist-json";

export type AdminChangeNotify = {
  action: string;
  detail?: string;
};

export function getAdminNotifyEmail() {
  return (
    process.env.ADMIN_NOTIFY_EMAIL?.trim() ||
    SUPPORT_EMAIL
  );
}

function formatWhen(date = new Date()) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function persistLine(persist?: PersistResult) {
  if (!persist) return "Persistenz: —";
  const parts = [
    persist.blob ? "Blob ✓" : "Blob –",
    persist.github ? "GitHub ✓" : "GitHub –",
    persist.disk ? "Disk ✓" : "Disk –",
    persist.durable ? "dauerhaft" : "nicht dauerhaft",
  ];
  return `Persistenz: ${parts.join(" · ")}`;
}

/**
 * Fire-and-forget mail when Admin CMS content was changed.
 * Never throws to callers — save responses must not depend on SMTP.
 */
export function queueAdminChangeNotify(
  notify: AdminChangeNotify,
  persist?: PersistResult,
) {
  void notifyAdminChange(notify, persist).catch(() => {
    /* ignore mail errors */
  });
}

export async function notifyAdminChange(
  notify: AdminChangeNotify,
  persist?: PersistResult,
) {
  if (!isMailConfigured()) return;

  const to = getAdminNotifyEmail();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.wassana-thai-imbiss.de";
  const when = formatWhen();
  const detail = notify.detail?.trim();

  const text = [
    "Wassana Admin — Änderung erkannt",
    "",
    `Aktion: ${notify.action}`,
    `Zeit: ${when}`,
    `Website: ${siteUrl}`,
    persistLine(persist),
    detail ? "" : null,
    detail || null,
    "",
    "Admin öffnen:",
    `${siteUrl}/admin`,
    "",
    "Du erhältst diese Mail bei jeder Veröffentlichung / Speicherung im Admin.",
  ]
    .filter((line) => line != null)
    .join("\n");

  await sendMail({
    to,
    subject: `[Wassana Admin] ${notify.action}`,
    text,
  });
}
