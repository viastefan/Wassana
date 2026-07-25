import path from "path";
import webpush from "web-push";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
} from "@/lib/persist-json";
import { sanitizeText } from "@/lib/security";

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type Store = {
  subscriptions: PushSubscriptionJSON[];
  updatedAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "push-subscriptions.json");
const TMP_PATH = path.join("/tmp", "wassana-push-subscriptions.json");

function getVapid() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:wassanathaiimbiss@icloud.de";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey(): string | null {
  return getVapid()?.publicKey || null;
}

export function isPushConfigured(): boolean {
  return Boolean(getVapid());
}

async function readStore(): Promise<Store> {
  const raw = await readJsonWithFallback<Store>(
    DATA_PATH,
    TMP_PATH,
    "data/push-subscriptions.json",
  );
  if (raw?.subscriptions) return raw;
  return { subscriptions: [], updatedAt: new Date().toISOString() };
}

async function writeStore(store: Store) {
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/push-subscriptions.json",
    "chore: update push subscriptions",
  );
}

function isValidSubscription(sub: PushSubscriptionJSON | null | undefined) {
  return Boolean(
    sub?.endpoint &&
      typeof sub.endpoint === "string" &&
      sub.endpoint.startsWith("https://") &&
      sub.keys?.p256dh &&
      sub.keys?.auth,
  );
}

export async function savePushSubscription(sub: PushSubscriptionJSON) {
  if (!isValidSubscription(sub)) {
    throw new Error("Ungültige Push-Subscription.");
  }
  const store = await readStore();
  const next = store.subscriptions.filter(
    (item) => item.endpoint !== sub.endpoint,
  );
  next.push({
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime ?? null,
    keys: {
      p256dh: String(sub.keys?.p256dh),
      auth: String(sub.keys?.auth),
    },
  });
  await writeStore({
    subscriptions: next.slice(-40),
    updatedAt: new Date().toISOString(),
  });
  return next.length;
}

export async function removePushSubscription(endpoint: string) {
  const store = await readStore();
  const next = store.subscriptions.filter((item) => item.endpoint !== endpoint);
  await writeStore({
    subscriptions: next,
    updatedAt: new Date().toISOString(),
  });
  return next.length;
}

export async function listPushSubscriptionCount() {
  const store = await readStore();
  return store.subscriptions.length;
}

export async function sendPushToAll(input: PushPayload) {
  const vapid = getVapid();
  if (!vapid) {
    return {
      ok: false as const,
      sent: 0,
      failed: 0,
      error: "Push ist nicht konfiguriert (VAPID-Keys fehlen).",
    };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const title = sanitizeText(input.title, 80) || "Wassana";
  const body = sanitizeText(input.body, 200) || "";
  const url = sanitizeText(input.url || "/admin", 200) || "/admin";
  const tag = sanitizeText(input.tag || "wassana", 60) || "wassana";
  const payload = JSON.stringify({ title, body, url, tag });

  const store = await readStore();
  if (!store.subscriptions.length) {
    return {
      ok: false as const,
      sent: 0,
      failed: 0,
      error: "Kein Gerät für Benachrichtigungen registriert.",
    };
  }

  let sent = 0;
  let failed = 0;
  const keep: PushSubscriptionJSON[] = [];

  await Promise.all(
    store.subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, payload);
        sent += 1;
        keep.push(sub);
      } catch (error) {
        failed += 1;
        const status =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;
        // Keep temporary failures; drop gone/expired endpoints.
        if (status !== 404 && status !== 410) {
          keep.push(sub);
        }
      }
    }),
  );

  if (keep.length !== store.subscriptions.length) {
    await writeStore({
      subscriptions: keep,
      updatedAt: new Date().toISOString(),
    });
  }

  return { ok: sent > 0, sent, failed, error: sent ? undefined : "Senden fehlgeschlagen." };
}
