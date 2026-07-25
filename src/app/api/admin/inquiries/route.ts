import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  listInquiries,
  markAllInquiriesRead,
  markInquiryRead,
} from "@/lib/inquiries";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKING_COURSE_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const inquiries = await listInquiries();
  const unread = inquiries.filter((item) => !item.read).length;
  return NextResponse.json(
    { inquiries, unread },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    id?: string;
    read?: boolean;
    all?: boolean;
  }>(request, 4_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (body.all) {
    const inquiries = await markAllInquiriesRead();
    return NextResponse.json({
      inquiries,
      unread: 0,
    });
  }

  if (!body.id) {
    return NextResponse.json({ error: "ID fehlt." }, { status: 400 });
  }

  const updated = await markInquiryRead(body.id, body.read !== false);
  if (!updated) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const inquiries = await listInquiries();
  const unread = inquiries.filter((item) => !item.read).length;
  return NextResponse.json({ inquiry: updated, inquiries, unread });
}
