import { NextResponse } from "next/server";
import { addInquiry } from "@/lib/inquiries";
import { getOwnerInbox, isMailConfigured, sendMail } from "@/lib/mail";
import {
  assertSameOrigin,
  getClientIp,
  isValidEmail,
  rateLimit,
  sanitizeHeader,
  sanitizeText,
} from "@/lib/security";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  source?: string;
  website?: string;
};

const ALLOWED_SOURCES = new Set([
  "website",
  "kontakt",
  "kochkurs",
  "catering",
]);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`contact:${ip}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitizeHeader(String(body.name || ""), 120);
  const email = sanitizeHeader(String(body.email || "").toLowerCase(), 160);
  const phone = sanitizeHeader(String(body.phone || ""), 60);
  const message = sanitizeText(String(body.message || ""), 4000);
  const subject = sanitizeHeader(
    String(body.subject || "Anfrage über die Website"),
    160,
  );
  const sourceRaw = sanitizeHeader(String(body.source || "website"), 40);
  const source = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : "website";

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Bitte einen gültigen Namen angeben." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail angeben." },
      { status: 400 },
    );
  }
  if (message.length < 5) {
    return NextResponse.json(
      { error: "Bitte eine kurze Nachricht schreiben." },
      { status: 400 },
    );
  }

  const owner = getOwnerInbox();
  let mailOwnerSent = false;
  let mailGuestSent = false;
  let mailWarning: string | undefined;

  const ownerText = [
    `Neue Anfrage über ${site.shortName}`,
    "",
    `Betreff: ${subject}`,
    `Quelle: ${source}`,
    `Name: ${name}`,
    `E-Mail: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    "",
    "Nachricht:",
    message,
    "",
    "—",
    "Diese Anfrage liegt auch im Admin-Bereich unter Anfragen.",
  ]
    .filter(Boolean)
    .join("\n");

  const guestText = [
    `Sawasdee ${name},`,
    "",
    `vielen Dank für deine Nachricht an ${site.fullName}.`,
    "Wir haben deine Anfrage erhalten und melden uns so bald wie möglich.",
    "",
    "Deine Nachricht:",
    message,
    "",
    "—",
    site.fullName,
    `${site.address.street}, ${site.address.zip} ${site.address.city}`,
    site.phone,
    site.email,
  ].join("\n");

  if (isMailConfigured()) {
    try {
      await sendMail({
        to: owner,
        subject: `[Website] ${subject} — ${name}`,
        text: ownerText,
        replyTo: email,
      });
      mailOwnerSent = true;
    } catch {
      mailWarning = "Speichern ok, Inhaber-Mail konnte nicht gesendet werden.";
    }

    try {
      await sendMail({
        to: email,
        subject: `Deine Anfrage bei ${site.name}`,
        text: guestText,
      });
      mailGuestSent = true;
    } catch {
      mailWarning = mailWarning
        ? "Speichern ok, E-Mails konnten nicht gesendet werden."
        : "Speichern ok, Bestätigungsmail konnte nicht gesendet werden.";
    }
  } else {
    mailWarning =
      "Anfrage gespeichert. E-Mail-Versand ist noch nicht konfiguriert (SMTP_*).";
  }

  try {
    const inquiry = await addInquiry({
      name,
      email,
      phone,
      subject,
      message,
      source,
      mailOwnerSent,
      mailGuestSent,
    });

    return NextResponse.json({
      ok: true,
      id: inquiry.id,
      mailOwnerSent,
      mailGuestSent,
      warning: mailWarning,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Anfrage konnte nicht gespeichert werden. Bitte telefonisch oder per E-Mail kontaktieren.",
      },
      { status: 500 },
    );
  }
}
