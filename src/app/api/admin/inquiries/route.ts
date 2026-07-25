import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import {
  deleteInquiry,
  inquiryStorageMode,
  isInquiryStoreDurable,
  listInquiries,
  markAllInquiriesRead,
  updateInquiry,
  type InquiryUpdate,
} from "@/lib/inquiries";
import type { InquiryStatus } from "@/lib/inquiries-shared";
import { assertSameOrigin, readJsonLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKING_COURSE_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

function inboxPayload(inquiries: Awaited<ReturnType<typeof listInquiries>>) {
  const stats = {
    total: inquiries.length,
    active: inquiries.filter((item) => !item.archived).length,
    archived: inquiries.filter((item) => item.archived).length,
    unread: inquiries.filter(
      (item) => !item.archived && (!item.read || item.status === "new"),
    ).length,
    done: inquiries.filter(
      (item) => !item.archived && item.status === "done",
    ).length,
    open: inquiries.filter(
      (item) => !item.archived && item.status === "open",
    ).length,
  };

  return {
    inquiries,
    unread: stats.unread,
    stats,
    durable: isInquiryStoreDurable(),
    storage: inquiryStorageMode(),
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const inquiries = await listInquiries({ includeArchived: true });
  return NextResponse.json(inboxPayload(inquiries), {
    headers: { "Cache-Control": "no-store" },
  });
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
    status?: InquiryStatus;
    notes?: string;
    archived?: boolean;
  }>(request, 8_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (body.all) {
    const inquiries = await markAllInquiriesRead();
    return NextResponse.json(inboxPayload(inquiries));
  }

  if (!body.id) {
    return NextResponse.json({ error: "ID fehlt." }, { status: 400 });
  }

  const patch: InquiryUpdate = {};
  if (typeof body.read === "boolean") patch.read = body.read;
  if (body.status === "new" || body.status === "open" || body.status === "done") {
    patch.status = body.status;
  }
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.archived === "boolean") patch.archived = body.archived;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
  }

  const updated = await updateInquiry(body.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const inquiries = await listInquiries({ includeArchived: true });
  return NextResponse.json({
    inquiry: updated,
    ...inboxPayload(inquiries),
  });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{ id?: string }>(request, 2_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (!parsed.data.id) {
    return NextResponse.json({ error: "ID fehlt." }, { status: 400 });
  }

  const ok = await deleteInquiry(parsed.data.id);
  if (!ok) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const inquiries = await listInquiries({ includeArchived: true });
  return NextResponse.json(inboxPayload(inquiries));
}
