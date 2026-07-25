import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  completeCookingCourse,
  deleteArchivedCookingCourse,
  deleteCurrentCookingCourse,
  getCookingCourseStore,
  updateArchivedCookingCourse,
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
  const store = await getCookingCourseStore();
  return NextResponse.json(store, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const parsed = await readJsonLimited<{
    action?: string;
    id?: string;
    fazit?: string;
    notes?: string;
  }>(request, 8_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const action = String(parsed.data.action || "").trim();

  try {
    if (action === "complete") {
      const { store, persist } = await completeCookingCourse({
        fazit: parsed.data.fazit || "",
        notes: parsed.data.notes || "",
      });
      return persistWarningOrFail({ ...store }, persist, {
        action: "Kochkurs abgehakt & archiviert",
        detail: store.archive?.[0]
          ? `${store.archive[0].title} · ${store.archive[0].date}`
          : undefined,
      });
    }

    if (action === "delete-current") {
      const { store, persist } = await deleteCurrentCookingCourse();
      return persistWarningOrFail({ ...store }, persist, {
        action: "Aktuellen Kochkurs gelöscht",
      });
    }

    if (action === "delete-archive") {
      const id = String(parsed.data.id || "").trim();
      if (!id) {
        return NextResponse.json(
          { error: "Archiv-ID fehlt." },
          { status: 400 },
        );
      }
      const { store, persist } = await deleteArchivedCookingCourse(id);
      return persistWarningOrFail({ ...store }, persist, {
        action: "Kochkurs-Archiv-Eintrag gelöscht",
        detail: `ID: ${id}`,
      });
    }

    if (action === "update-archive") {
      const id = String(parsed.data.id || "").trim();
      if (!id) {
        return NextResponse.json(
          { error: "Archiv-ID fehlt." },
          { status: 400 },
        );
      }
      const { store, persist } = await updateArchivedCookingCourse({
        id,
        fazit: parsed.data.fazit,
        notes: parsed.data.notes,
      });
      return persistWarningOrFail({ ...store }, persist, {
        action: "Kochkurs-Archiv aktualisiert",
        detail: `ID: ${id}`,
      });
    }

    return NextResponse.json(
      { error: "Unbekannte Aktion." },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Aktion fehlgeschlagen.",
      },
      { status: 503 },
    );
  }
}
