import nodemailer from "nodemailer";
import { site } from "@/lib/site";

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

export function getOwnerInbox() {
  return (
    process.env.CONTACT_TO?.trim() ||
    process.env.SMTP_USER?.trim() ||
    site.email
  );
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
    subject: payload.subject,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}
