import nodemailer from "nodemailer";
import { site } from "@/lib/site";

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
};

/** Always notified on website inquiries (in addition to CONTACT_TO extras). */
export const DEFAULT_INQUIRY_INBOXES = [
  "stefandirnberger@viawen.com",
  "wassanathaiimbiss@icloud.de",
] as const;

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

/** @deprecated Prefer getOwnerInboxes() — kept for single-recipient call sites. */
export function getOwnerInbox() {
  return getOwnerInboxes().join(", ");
}

/**
 * Deduped owner inboxes for contact inquiries.
 * Always includes Stefan + Wassana iCloud; merges CONTACT_TO / SMTP_USER extras.
 */
export function getOwnerInboxes(): string[] {
  const extras = [process.env.CONTACT_TO, process.env.SMTP_USER, site.email]
    .flatMap((value) =>
      String(value || "")
        .split(/[,;]+/)
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean),
    );

  const merged = [...DEFAULT_INQUIRY_INBOXES, ...extras];
  return [...new Set(merged)];
}

export function getMailFrom() {
  const fromAddress =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    site.email;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || site.fullName;
  return `"${fromName}" <${fromAddress}>`;
}

export async function sendMail(payload: MailPayload) {
  if (!isMailConfigured()) {
    throw new Error("E-Mail ist nicht konfiguriert (SMTP_* fehlt).");
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: getMailFrom(),
    to: payload.to,
    cc: payload.cc,
    bcc: payload.bcc,
    subject: payload.subject,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}
