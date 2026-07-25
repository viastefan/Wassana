import { NextResponse } from "next/server";
import {
  createPasswordResetToken,
  consumePasswordResetToken,
  setAdminPasswordOverride,
} from "@/lib/admin-password-store";
import { SUPPORT_EMAIL } from "@/lib/admin-support";
import { getSiteUrl } from "@/lib/site";
import { isMailConfigured, sendMail } from "@/lib/mail";
import {
  assertSameOrigin,
  getClientIp,
  rateLimit,
  readJsonLimited,
  sanitizeHeader,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-reset:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Reset-Anfragen. Bitte später erneut." },
      { status: 429 },
    );
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    action?: "request" | "confirm";
    token?: string;
    password?: string;
    report?: string;
  }>(request, 20_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const action = parsed.data.action || "request";

  if (action === "confirm") {
    const token = sanitizeHeader(String(parsed.data.token || ""), 200);
    const password = String(parsed.data.password || "");
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Neues Passwort mindestens 8 Zeichen." },
        { status: 400 },
      );
    }
    if (!(await consumePasswordResetToken(token))) {
      return NextResponse.json(
        { error: "Reset-Link ungültig oder abgelaufen." },
        { status: 400 },
      );
    }
    await setAdminPasswordOverride(password);
    return NextResponse.json({
      ok: true,
      message: "Neues Passwort ist aktiv. Du kannst dich jetzt anmelden.",
    });
  }

  const token = await createPasswordResetToken();
  const resetUrl = `${getSiteUrl()}/admin/reset?token=${encodeURIComponent(token)}`;
  const report = String(parsed.data.report || "").slice(0, 6000);

  const text = [
    "Wassana Admin — Neues Passwort erstellen",
    "",
    "Über diesen Link kannst du ein neues Admin-Passwort setzen (1 Stunde gültig):",
    resetUrl,
    "",
    report ? "Angehängter Statusbericht:" : null,
    report || null,
    "",
    `Support: ${SUPPORT_EMAIL}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  let mailed = false;
  let mailError: string | undefined;
  if (isMailConfigured()) {
    try {
      await sendMail({
        to: SUPPORT_EMAIL,
        subject: "Wassana Admin — Passwort neu setzen",
        text,
      });
      mailed = true;
    } catch (error) {
      mailError =
        error instanceof Error ? error.message : "E-Mail-Versand fehlgeschlagen.";
    }
  }

  return NextResponse.json({
    ok: true,
    mailed,
    mailError,
    resetUrl,
    supportEmail: SUPPORT_EMAIL,
    message: mailed
      ? `Reset-Mail an ${SUPPORT_EMAIL} gesendet.`
      : "SMTP nicht konfiguriert — Reset-Link unten / per mailto nutzen.",
  });
}
