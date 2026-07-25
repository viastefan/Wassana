"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatCourseDate } from "@/lib/cooking-course-format";
import type { SiteContent } from "@/lib/site-content";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store";

type Course = {
  active: boolean;
  date: string;
  title: string;
  teaser: string;
  updatedAt?: string;
};

type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  read: boolean;
  mailOwnerSent: boolean;
  mailGuestSent: boolean;
};

type Tab = "home" | "course" | "inbox" | "content" | "banner" | "menu";

const BANNER_PRESETS = [
  { label: "Rot", backgroundColor: "#7a0c24", textColor: "#f7f3ea", highlightColor: "#cbb892" },
  { label: "Gold", backgroundColor: "#b59551", textColor: "#1e2129", highlightColor: "#7a0c24" },
  { label: "Dunkel", backgroundColor: "#1e2129", textColor: "#f7f3ea", highlightColor: "#cbb892" },
  { label: "Creme", backgroundColor: "#ebe4d8", textColor: "#1e2129", highlightColor: "#7a0c24" },
] as const;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const fieldClass =
  "mt-2 w-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-[color:var(--ink)] outline-none focus:border-[color:var(--red)]";

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const [course, setCourse] = useState<Course>({
    active: true,
    date: "",
    title: "Thai Kochkurs",
    teaser: "Noch Plätze frei",
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unread, setUnread] = useState(0);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [weekly, setWeekly] = useState<WeeklyMenuData | null>(null);

  const loadInbox = useCallback(async () => {
    const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      inquiries: Inquiry[];
      unread: number;
    };
    setInquiries(data.inquiries || []);
    setUnread(data.unread || 0);
  }, []);

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setContent((await res.json()) as SiteContent);
  }, []);

  const loadWeekly = useCallback(async () => {
    const res = await fetch("/api/admin/weekly-menu", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setWeekly((await res.json()) as WeeklyMenuData);
  }, []);

  const loadAll = useCallback(async () => {
    const courseRes = await fetch("/api/cooking-course", { cache: "no-store" });
    if (courseRes.ok) setCourse((await courseRes.json()) as Course);
    await Promise.all([loadInbox(), loadContent(), loadWeekly()]);
  }, [loadContent, loadInbox, loadWeekly]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.register("/admin-sw.js").catch(() => null);
        }

        const courseRes = await fetch("/api/cooking-course", {
          cache: "no-store",
        });
        if (courseRes.ok && !cancelled) {
          setCourse((await courseRes.json()) as Course);
        }

        const session = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!cancelled && session.ok) {
          setAuthed(true);
          await loadAll();
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setInstallEvent(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function onInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setLoginError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setLoginError(data?.error || "Login fehlgeschlagen.");
        return;
      }
      setPassword("");
      setAuthed(true);
      setTab("home");
      await loadAll();
    } catch {
      setLoginError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setTab("home");
    setInquiries([]);
    setUnread(0);
  }

  async function saveCourse(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/cooking-course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });
      const data = (await res.json().catch(() => null)) as
        | (Course & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Speichern fehlgeschlagen.");
        return;
      }
      if (data) {
        setCourse({
          active: data.active,
          date: data.date,
          title: data.title,
          teaser: data.teaser,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(
        data?.warning ||
          `Kochkurs gespeichert — Widget: ${course.title} am ${formatCourseDate(course.date)}`,
      );
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json().catch(() => null)) as
        | (SiteContent & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Website-Texte speichern fehlgeschlagen.");
        return;
      }
      if (data) {
        setContent({
          hero: data.hero,
          meaning: data.meaning,
          hours: data.hours,
          studentLunch: data.studentLunch,
          topBanner: data.topBanner,
          location: data.location,
          closing: data.closing,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(data?.warning || "Website-Texte aktualisiert.");
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function saveWeekly(event: FormEvent) {
    event.preventDefault();
    if (!weekly) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/weekly-menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weekly),
      });
      const data = (await res.json().catch(() => null)) as
        | (WeeklyMenuData & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Wochenkarte speichern fehlgeschlagen.");
        return;
      }
      if (data) {
        setWeekly({
          note: data.note,
          days: data.days,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(data?.warning || "Wochenkarte aktualisiert.");
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function markRead(id: string) {
    const res = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      inquiries: Inquiry[];
      unread: number;
    };
    setInquiries(data.inquiries || []);
    setUnread(data.unread || 0);
  }

  async function markAllRead() {
    const res = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      inquiries: Inquiry[];
      unread: number;
    };
    setInquiries(data.inquiries || []);
    setUnread(data.unread || 0);
  }

  const nav = useMemo(
    () =>
      [
        { id: "home" as const, label: "Home" },
        { id: "course" as const, label: "Kurs" },
        {
          id: "inbox" as const,
          label: unread > 0 ? `Post (${unread})` : "Post",
        },
        { id: "banner" as const, label: "Banner" },
        { id: "content" as const, label: "Texte" },
        { id: "menu" as const, label: "Menü" },
      ] as const,
    [unread],
  );

  return (
    <div className="admin-shell min-h-[100svh] bg-[color:var(--bg)] text-[color:var(--ink)]">
      <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--paper)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image
            src="/admin/icon-192.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-[color:var(--red)]">
              Wassana Verwaltung
            </p>
            <p className="truncate text-xs text-[color:var(--muted)]">
              Für den Besitzer · als App installierbar
            </p>
          </div>
          {authed ? (
            <button type="button" className="btn-gold !px-3 !py-2 text-sm" onClick={onLogout}>
              Raus
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {checking ? (
          <p className="text-sm text-[color:var(--muted)]">Laden …</p>
        ) : !authed ? (
          <form onSubmit={onLogin} className="space-y-4">
            <h1 className="font-display text-3xl text-[color:var(--red)]">
              Anmelden
            </h1>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Hier verwaltest du Kochkurs, Anfragen, Website-Texte und die
              Wochenkarte. Danach kannst du die App auf dem Handy speichern.
            </p>
            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">Passwort</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                required
              />
            </label>
            {loginError ? (
              <p className="text-sm text-[color:var(--red)]">{loginError}</p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Prüfen …" : "Anmelden"}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-4">
              <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                App
              </p>
              {installed ? (
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Läuft als installierte App auf diesem Gerät.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    Auf dem Startbildschirm speichern — wie eine richtige App
                    für den Laden.
                  </p>
                  {installEvent ? (
                    <button
                      type="button"
                      className="btn-primary mt-3"
                      onClick={() => void onInstall()}
                    >
                      App installieren
                    </button>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      iPhone: Teilen-Symbol → „Zum Home-Bildschirm“. Android:
                      Browser-Menü → „App installieren“.
                    </p>
                  )}
                </>
              )}
            </div>

            {tab === "home" ? (
              <section className="space-y-4">
                <h1 className="font-display text-3xl text-[color:var(--red)]">
                  Übersicht
                </h1>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="admin-card text-left"
                    onClick={() => setTab("course")}
                  >
                    <p className="text-sm text-[color:var(--gold)]">Kochkurs</p>
                    <p className="mt-2 font-display text-xl text-[color:var(--red)]">
                      {course.title || "Termin"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {course.date
                        ? formatCourseDate(course.date)
                        : "Noch kein Datum"}
                      {course.active ? " · aktiv" : " · aus"}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card text-left"
                    onClick={() => setTab("inbox")}
                  >
                    <p className="text-sm text-[color:var(--gold)]">Anfragen</p>
                    <p className="mt-2 font-display text-xl text-[color:var(--red)]">
                      {unread > 0 ? `${unread} neu` : "Posteingang"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {inquiries.length} insgesamt
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card text-left"
                    onClick={() => setTab("banner")}
                  >
                    <p className="text-sm text-[color:var(--gold)]">Top-Banner</p>
                    <p className="mt-2 font-display text-xl text-[color:var(--red)]">
                      {content?.topBanner?.active ? "Sichtbar" : "Aus"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Mittagsangebot über dem Menü
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card text-left"
                    onClick={() => setTab("content")}
                  >
                    <p className="text-sm text-[color:var(--gold)]">Website</p>
                    <p className="mt-2 font-display text-xl text-[color:var(--red)]">
                      Texte ändern
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Hero, Zeiten, Schüler-Mittag …
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card text-left"
                    onClick={() => setTab("menu")}
                  >
                    <p className="text-sm text-[color:var(--gold)]">Speisekarte</p>
                    <p className="mt-2 font-display text-xl text-[color:var(--red)]">
                      Wochenkarte
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Mo–Fr Gerichte pflegen
                    </p>
                  </button>
                </div>
                <Link href="/" className="btn-gold inline-flex">
                  Öffentliche Website ansehen
                </Link>
              </section>
            ) : null}

            {tab === "course" ? (
              <form onSubmit={saveCourse} className="space-y-5">
                <h1 className="font-display text-3xl text-[color:var(--red)]">
                  Thai Kochkurs
                </h1>
                <p className="text-sm text-[color:var(--muted)]">
                  Termin und Texte für den Hinweis unten rechts auf der Website.
                </p>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={course.active}
                    onChange={(e) =>
                      setCourse((c) => ({ ...c, active: e.target.checked }))
                    }
                    className="h-4 w-4 accent-[color:var(--red)]"
                  />
                  <span>Auf der Website anzeigen</span>
                </label>
                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">Datum</span>
                  <input
                    type="date"
                    value={course.date}
                    onChange={(e) =>
                      setCourse((c) => ({ ...c, date: e.target.value }))
                    }
                    className={fieldClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">Titel</span>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) =>
                      setCourse((c) => ({ ...c, title: e.target.value }))
                    }
                    className={fieldClass}
                    placeholder="Thai Kochkurs / Pad Thai Abend"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">
                    Kurztext
                  </span>
                  <input
                    type="text"
                    value={course.teaser}
                    onChange={(e) =>
                      setCourse((c) => ({ ...c, teaser: e.target.value }))
                    }
                    className={fieldClass}
                    placeholder="Noch Plätze frei"
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Speichern …" : "Kochkurs speichern"}
                </button>
              </form>
            ) : null}

            {tab === "inbox" ? (
              <section className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="font-display text-3xl text-[color:var(--red)]">
                      Anfragen
                    </h1>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Aus Kontakt, Catering und Kochkurs-Formulare.
                    </p>
                  </div>
                  {unread > 0 ? (
                    <button
                      type="button"
                      className="btn-gold"
                      onClick={() => void markAllRead()}
                    >
                      Alle gelesen
                    </button>
                  ) : null}
                </div>
                {inquiries.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    Noch keine Anfragen.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {inquiries.map((item) => (
                      <li
                        key={item.id}
                        className={`border border-[color:var(--line)] px-4 py-4 ${
                          item.read
                            ? "bg-[color:var(--paper)]"
                            : "bg-[color:var(--bg-soft)]"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm tracking-[0.14em] text-[color:var(--gold)] uppercase">
                              {item.subject}
                              {!item.read ? " · Neu" : ""}
                            </p>
                            <p className="mt-1">
                              {item.name} ·{" "}
                              <a
                                href={`mailto:${item.email}`}
                                className="text-[color:var(--red)] underline-offset-2 hover:underline"
                              >
                                {item.email}
                              </a>
                              {item.phone ? ` · ${item.phone}` : ""}
                            </p>
                            <p className="mt-1 text-sm text-[color:var(--muted)]">
                              {formatWhen(item.createdAt)} · {item.source}
                            </p>
                          </div>
                          {!item.read ? (
                            <button
                              type="button"
                              className="btn-gold"
                              onClick={() => void markRead(item.id)}
                            >
                              Gelesen
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-4 whitespace-pre-wrap leading-relaxed">
                          {item.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {tab === "banner" && content ? (
              <form onSubmit={saveContent} className="space-y-5">
                <h1 className="font-display text-3xl text-[color:var(--red)]">
                  Top-Banner
                </h1>
                <p className="text-sm text-[color:var(--muted)]">
                  Erscheint über dem Menü auf allen öffentlichen Seiten — z. B.
                  für das Schüler-Mittagsangebot.
                </p>

                <label className="flex items-center gap-3 border border-[color:var(--line)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={content.topBanner.active}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        topBanner: {
                          ...content.topBanner,
                          active: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Banner anzeigen</span>
                </label>

                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">Text</span>
                  <input
                    value={content.topBanner.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        topBanner: {
                          ...content.topBanner,
                          text: e.target.value,
                        },
                      })
                    }
                    className={fieldClass}
                    placeholder="Schüler & Azubis mittags: Gericht inkl. Getränk"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">
                    Hervorhebung (z. B. Preis)
                  </span>
                  <input
                    value={content.topBanner.highlight}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        topBanner: {
                          ...content.topBanner,
                          highlight: e.target.value,
                        },
                      })
                    }
                    className={fieldClass}
                    placeholder="ab 8,90 €"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Link-Ziel
                    </span>
                    <input
                      value={content.topBanner.linkHref}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            linkHref: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="/speisekarte#wochenkarte"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Link-Text
                    </span>
                    <input
                      value={content.topBanner.linkLabel}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            linkLabel: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="Mehr"
                    />
                  </label>
                </div>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Farben
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
                        style={{
                          backgroundColor: preset.backgroundColor,
                          color: preset.textColor,
                        }}
                        onClick={() =>
                          setContent({
                            ...content,
                            topBanner: {
                              ...content.topBanner,
                              backgroundColor: preset.backgroundColor,
                              textColor: preset.textColor,
                              highlightColor: preset.highlightColor,
                            },
                          })
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {(
                    [
                      ["backgroundColor", "Hintergrund"],
                      ["textColor", "Textfarbe"],
                      ["highlightColor", "Hervorhebung"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-[color:var(--muted)]">
                        {label}
                      </span>
                      <input
                        type="color"
                        value={content.topBanner[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            topBanner: {
                              ...content.topBanner,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="h-10 w-16 cursor-pointer border border-[color:var(--line)] bg-transparent"
                      />
                    </label>
                  ))}
                </fieldset>

                <div
                  className="overflow-hidden border border-[color:var(--line)]"
                  aria-hidden
                >
                  <p className="px-3 py-2 text-xs tracking-[0.16em] text-[color:var(--gold)] uppercase">
                    Vorschau
                  </p>
                  <div
                    className="px-4 py-2 text-center text-sm"
                    style={{
                      backgroundColor: content.topBanner.backgroundColor,
                      color: content.topBanner.textColor,
                    }}
                  >
                    {content.topBanner.text || "Banner-Text"}{" "}
                    {content.topBanner.highlight ? (
                      <span
                        className="font-semibold"
                        style={{ color: content.topBanner.highlightColor }}
                      >
                        {content.topBanner.highlight}
                      </span>
                    ) : null}
                    {content.topBanner.linkLabel ? (
                      <span
                        className="ml-2 underline"
                        style={{ color: content.topBanner.highlightColor }}
                      >
                        {content.topBanner.linkLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-gold"
                  onClick={() =>
                    setContent({
                      ...content,
                      topBanner: {
                        ...content.topBanner,
                        active: true,
                        text: `${content.studentLunch.eyebrow}: ${content.studentLunch.title}`,
                        highlight: content.studentLunch.price,
                        linkHref: "/speisekarte#wochenkarte",
                        linkLabel: "Mehr",
                      },
                    })
                  }
                >
                  Aus Schüler-Mittag übernehmen
                </button>

                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Speichern …" : "Banner speichern"}
                </button>
              </form>
            ) : null}

            {tab === "content" && content ? (
              <form onSubmit={saveContent} className="space-y-5">
                <h1 className="font-display text-3xl text-[color:var(--red)]">
                  Website-Texte
                </h1>
                <p className="text-sm text-[color:var(--muted)]">
                  Diese Texte erscheinen direkt auf der öffentlichen Seite.
                </p>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Hero Startseite
                  </legend>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Begrüßung über Wassana (z. B. Willkommen bei)
                    </span>
                    <input
                      value={content.hero.eyebrow}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, eyebrow: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Text unter Wassana
                    </span>
                    <textarea
                      rows={2}
                      value={content.hero.lede}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, lede: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                </fieldset>

                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">
                    Bedeutung „Wassana“
                  </span>
                  <textarea
                    rows={3}
                    value={content.meaning}
                    onChange={(e) =>
                      setContent({ ...content, meaning: e.target.value })
                    }
                    className={fieldClass}
                  />
                </label>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Öffnungszeiten
                  </legend>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Kurz (z. B. Mo–Fr …)
                    </span>
                    <input
                      value={content.hours.weekdays}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekdays: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Lang (Wochentage)
                    </span>
                    <input
                      value={content.hours.weekdaysLong}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: {
                            ...content.hours,
                            weekdaysLong: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Wochenende / Feiertage
                    </span>
                    <input
                      value={content.hours.weekend}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekend: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                </fieldset>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Schüler-Mittag
                  </legend>
                  {(
                    [
                      ["eyebrow", "Überschrift klein"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                      ["price", "Preis"],
                      ["note", "Hinweis"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="text-sm text-[color:var(--muted)]">
                        {label}
                      </span>
                      <input
                        value={content.studentLunch[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            studentLunch: {
                              ...content.studentLunch,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                  ))}
                </fieldset>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Standort-Texte
                  </legend>
                  {(
                    [
                      ["eyebrow", "Kleine Zeile"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="text-sm text-[color:var(--muted)]">
                        {label}
                      </span>
                      <input
                        value={content.location[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            location: {
                              ...content.location,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                  ))}
                </fieldset>

                <fieldset className="space-y-3 border border-[color:var(--line)] px-4 py-4">
                  <legend className="px-1 text-sm text-[color:var(--gold)]">
                    Abschluss
                  </legend>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">Titel</span>
                    <input
                      value={content.closing.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          closing: {
                            ...content.closing,
                            title: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[color:var(--muted)]">
                      Text (leer = Adresse + Zeiten automatisch)
                    </span>
                    <textarea
                      rows={2}
                      value={content.closing.text}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          closing: {
                            ...content.closing,
                            text: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                </fieldset>

                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Speichern …" : "Texte speichern"}
                </button>
              </form>
            ) : null}

            {tab === "menu" && weekly ? (
              <form onSubmit={saveWeekly} className="space-y-5">
                <h1 className="font-display text-3xl text-[color:var(--red)]">
                  Wochenkarte
                </h1>
                <p className="text-sm text-[color:var(--muted)]">
                  Jeden Tag Gericht und Preise für die Speisekarte aktualisieren.
                </p>
                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">
                    Hinweis unter dem Titel
                  </span>
                  <input
                    value={weekly.note}
                    onChange={(e) =>
                      setWeekly({ ...weekly, note: e.target.value })
                    }
                    className={fieldClass}
                  />
                </label>

                {weekly.days.map((day, dayIndex) => (
                  <fieldset
                    key={`${day.day}-${dayIndex}`}
                    className="space-y-3 border border-[color:var(--line)] px-4 py-4"
                  >
                    <legend className="px-1 text-sm text-[color:var(--gold)]">
                      {day.day}
                    </legend>
                    <label className="block">
                      <span className="text-sm text-[color:var(--muted)]">
                        Gericht
                      </span>
                      <input
                        value={day.dish}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = { ...day, dish: e.target.value };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-[color:var(--muted)]">
                        Beschreibung
                      </span>
                      <input
                        value={day.description || ""}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = {
                            ...day,
                            description: e.target.value,
                          };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                      />
                    </label>
                    {day.items.map((item, itemIndex) => (
                      <div
                        key={`${item.nr}-${itemIndex}`}
                        className="grid grid-cols-[4rem_1fr_6rem] gap-2"
                      >
                        <input
                          aria-label="Nr"
                          value={item.nr}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            const items = [...day.items];
                            items[itemIndex] = {
                              ...item,
                              nr: e.target.value,
                            };
                            days[dayIndex] = { ...day, items };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                        />
                        <input
                          aria-label="Name"
                          value={item.name}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            const items = [...day.items];
                            items[itemIndex] = {
                              ...item,
                              name: e.target.value,
                            };
                            days[dayIndex] = { ...day, items };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                        />
                        <input
                          aria-label="Preis"
                          value={item.price}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            const items = [...day.items];
                            items[itemIndex] = {
                              ...item,
                              price: e.target.value,
                            };
                            days[dayIndex] = { ...day, items };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                        />
                      </div>
                    ))}
                  </fieldset>
                ))}

                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Speichern …" : "Wochenkarte speichern"}
                </button>
              </form>
            ) : null}

            {error ? (
              <p className="mt-5 text-sm text-[color:var(--red)]">{error}</p>
            ) : null}
            {status ? (
              <p className="mt-5 text-sm text-[color:var(--ink)]">{status}</p>
            ) : null}
          </>
        )}
      </main>

      {authed ? (
        <nav className="admin-tabbar fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--line)] bg-[color:var(--paper)]/95 backdrop-blur-md">
          <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError("");
                  setStatus("");
                  if (item.id === "inbox") void loadInbox();
                  if (item.id === "content" || item.id === "banner") {
                    void loadContent();
                  }
                  if (item.id === "menu") void loadWeekly();
                }}
                className={`rounded-lg px-0.5 py-2 text-center text-[0.62rem] leading-tight transition ${
                  tab === item.id
                    ? "bg-[color:var(--red)] text-white"
                    : "text-[color:var(--muted)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
