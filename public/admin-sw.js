/* Wassana Admin PWA — offline shell + notifications for /admin */
const CACHE = "wassana-admin-v3";
const PRECACHE = [
  "/admin",
  "/admin.webmanifest",
  "/admin/icon-192.png",
  "/admin/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin.")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (
          response.ok &&
          (url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".webmanifest") ||
            url.pathname === "/admin")
        ) {
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("/admin")),
      ),
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Wassana",
    body: "Neue Nachricht",
    url: "/admin",
    tag: "wassana",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    try {
      const text = event.data?.text();
      if (text) data.body = text;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Wassana", {
      body: data.body || "",
      icon: "/admin/icon-192.png",
      badge: "/admin/icon-192.png",
      tag: data.tag || "wassana",
      data: { url: data.url || "/admin" },
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes("/admin")) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
      return undefined;
    }),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_NOTIFICATION") return;
  event.waitUntil(
    self.registration.showNotification(data.title || "Wassana", {
      body: data.body || "",
      icon: "/admin/icon-192.png",
      badge: "/admin/icon-192.png",
      tag: data.tag || "local",
      data: { url: data.url || "/admin" },
    }),
  );
});
