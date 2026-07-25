import { NextResponse } from "next/server";
import { SUPPORT_EMAIL } from "@/lib/admin-support";
import { isMailConfigured, sendMail } from "@/lib/mail";
import {
  assertSameOrigin,
  getClientIp,
  rateLimit,
  readJsonLimited,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-support:${ip}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Support-Meldungen." },
      { status: 429 },
    );
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    subject?: string;
    report?: string;
  }>(request, 20_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const report = String(parsed.data.report || "").trim().slice(0, 8000);
  if (report.length < 20) {
    return NextResponse.json({ error: "Bericht fehlt." }, { status: 400 });
  }

  const subject =
    String(parsed.data.subject || "Wassana Admin — Störung").slice(0, 160);

  if (!isMailConfigured()) {
    return NextResponse.json({
      ok: false,
      mailed: false,
      supportEmail: SUPPORT_EMAIL,
      message:
        "SMTP nicht konfiguriert — bitte den mailto-Link im Dialog nutzen.",
    });
  }

  try {
    await sendMail({
      to: SUPPORT_EMAIL,
      subject,
      text: report,
    });
    return NextResponse.json({
      ok: true,
      mailed: true,
      supportEmail: SUPPORT_EMAIL,
      message: `Bericht an ${SUPPORT_EMAIL} gesendet.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mailed: false,
        supportEmail: SUPPORT_EMAIL,
        error:
          error instanceof Error
            ? error.message
            : "Support-Mail konnte nicht gesendet werden.",
      },
      { status: 503 },
    );
  }
}
