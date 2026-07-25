import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = getVapidPublicKey();
  return NextResponse.json(
    {
      configured: isPushConfigured(),
      publicKey,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
