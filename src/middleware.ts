import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "www.wassana-thai-imbiss.de";
const APEX_HOST = "wassana-thai-imbiss.de";

const BLOCKED_PREFIXES = [
  "/.env",
  "/wp-admin",
  "/wp-login",
  "/xmlrpc.php",
  "/.git",
  "/server-status",
  "/phpmyadmin",
  "/.aws",
  "/vendor/phpunit",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lower = pathname.toLowerCase();
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() || "";

  // Canonical host for SEO (avoid duplicate apex/www indexing)
  if (host === APEX_HOST) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (
    BLOCKED_PREFIXES.some(
      (prefix) => lower === prefix || lower.startsWith(`${prefix}/`),
    )
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // Next.js requires inline scripts for hydration; eval only in development tooling
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self'",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  // Never index admin / API
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
