"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function getNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function showLocalAdminNotification(input: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({
    type: "SHOW_NOTIFICATION",
    title: input.title,
    body: input.body,
    url: input.url || "/admin",
    tag: input.tag || "local",
  });
  return true;
}

export async function enableAdminPushNotifications(): Promise<{
  ok: boolean;
  error?: string;
  permission?: NotificationPermission | "unsupported";
}> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return {
      ok: false,
      error: "Dieses Gerät unterstützt keine App-Benachrichtigungen.",
      permission: "unsupported",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      error: "Benachrichtigungen wurden nicht erlaubt.",
      permission,
    };
  }

  const vapidRes = await fetch("/api/admin/push/vapid", { cache: "no-store" });
  const vapid = (await vapidRes.json().catch(() => null)) as {
    configured?: boolean;
    publicKey?: string | null;
  } | null;

  if (!vapid?.configured || !vapid.publicKey) {
    // Permission alone still allows local notifications on this device.
    await showLocalAdminNotification({
      title: "Wassana Verwaltung",
      body: "Benachrichtigungen sind aktiv.",
      tag: "welcome",
    });
    return {
      ok: true,
      permission,
      error:
        "Lokal aktiv. Für Push auch bei geschlossener App bitte VAPID-Keys auf Vercel setzen.",
    };
  }

  const reg = await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
    });
  }

  const saveRes = await fetch("/api/admin/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!saveRes.ok) {
    const data = (await saveRes.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      permission,
      error: data?.error || "Gerät konnte nicht registriert werden.",
    };
  }

  await showLocalAdminNotification({
    title: "Wassana Verwaltung",
    body: "Push-Benachrichtigungen sind jetzt aktiv.",
    tag: "welcome",
  });

  return { ok: true, permission };
}

export async function sendAdminPush(input: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  const res = await fetch("/api/admin/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => null)) as {
    error?: string;
    sent?: number;
    failed?: number;
  } | null;
  if (!res.ok) {
    return {
      ok: false as const,
      error: data?.error || "Senden fehlgeschlagen.",
      sent: data?.sent || 0,
      failed: data?.failed || 0,
    };
  }
  return {
    ok: true as const,
    sent: data?.sent || 0,
    failed: data?.failed || 0,
  };
}
