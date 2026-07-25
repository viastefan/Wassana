import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getBusinessProfile,
  saveBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { persistWarningOrFail } from "@/lib/persist-response";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const profile = await getBusinessProfile();
  return NextResponse.json(profile, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<Partial<BusinessProfile>>(request, 20_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!body.fullName?.trim() || !body.owner?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "Name, Inhaber und E-Mail sind Pflicht." },
      { status: 400 },
    );
  }

  try {
    const { profile, persist } = await saveBusinessProfile({
      fullName: body.fullName || "",
      shortName: body.shortName || "",
      owner: body.owner || "",
      street: body.street || "",
      zip: body.zip || "",
      city: body.city || "",
      region: body.region || "",
      country: body.country || "DE",
      phone: body.phone || "",
      email: body.email || "",
      instagram: body.instagram || "",
      instagramHandle: body.instagramHandle || "",
      facebook: body.facebook || "",
      taxNote: body.taxNote || "",
    });
    return persistWarningOrFail({ ...profile }, persist);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Speichern fehlgeschlagen.",
      },
      { status: 503 },
    );
  }
}
