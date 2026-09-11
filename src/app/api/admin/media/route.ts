import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKING_COURSE_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/cooking-course";
import { putPublicMedia } from "@/lib/persist-json";
import { assertSameOrigin } from "@/lib/security";
import {
  DEFAULT_SITE_IMAGES,
  sanitizeImageSrc,
  type SiteImageKey,
} from "@/lib/site-content-shared";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4_500_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const KEYS = new Set(Object.keys(DEFAULT_SITE_IMAGES));

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  const jar = await cookies();
  if (!verifyAdminSessionToken(jar.get(COOKING_COURSE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const form = await request.formData();
  const key = String(form.get("key") || "");
  const file = form.get("file");
  if (!KEYS.has(key)) {
    return NextResponse.json({ error: "Unbekanntes Bildfeld." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei gewählt." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Bitte JPG, PNG, WebP oder GIF." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Bild ist zu groß (max. 4,5 MB)." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const pathname = `cms/media/${key}-${Date.now()}.${extFor(file.type)}`;
  const stored = await putPublicMedia({
    pathname,
    body: bytes,
    contentType: file.type,
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.error }, { status: 503 });
  }

  const url = sanitizeImageSrc(
    stored.url,
    DEFAULT_SITE_IMAGES[key as SiteImageKey],
  );
  return NextResponse.json({ key, url });
}
