import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/cooking-course";
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
  const limited = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Login-Versuche. Bitte kurz warten." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin ist nicht konfiguriert. ADMIN_PASSWORD in Vercel setzen.",
      },
      { status: 503 },
    );
  }

  const parsed = await readJsonLimited<{ password?: string }>(request, 4_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const password = sanitizeHeader(String(parsed.data.password || ""), 200);
  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "Falsches Passwort." },
      { status: 401 },
    );
  }

  let token: string;
  try {
    token = createAdminSessionToken();
  } catch {
    return NextResponse.json(
      { error: "Admin-Sitzung konnte nicht erstellt werden." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKING_COURSE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKING_COURSE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
