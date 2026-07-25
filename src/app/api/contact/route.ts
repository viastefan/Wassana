import { NextResponse } from "next/server";
import { addInquiry } from "@/lib/inquiries";
import { getOwnerInbox, isMailConfigured, sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  source?: string;
  website?: string; // honeypot
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot — bots fill this, humans never see it
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  const subject = String(body.subject || "Anfrage über die Website").trim();
  const source = String(body.source || "website").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { error: "Bitte einen gültigen Namen angeben." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail angeben." },
      { status: 400 },
    );
  }
  if (message.length < 5 || message.length > 4000) {
    return NextResponse.json(
      { error: "Bitte eine kurze Nachricht schreiben." },
      { status: 400 },
    );
  }
  if (phone.length > 60) {
    return NextResponse.json(
      { error: "Telefonnummer ist zu lang." },
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
}
