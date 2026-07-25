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
import {
  Field,
  ScreenHeader,
  Section,
  StickySave,
  Toggle,
} from "./ui";

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

const fieldClass = "admin-field";

const NAV_META: Record<
  Tab,
  { label: string; glyph: string; title: string }
> = {
  home: { label: "Home", glyph: "HO", title: "Übersicht" },
  course: { label: "Kurs", glyph: "KK", title: "Kochkurs" },
  inbox: { label: "Post", glyph: "IN", title: "Anfragen" },
  banner: { label: "Banner", glyph: "BN", title: "Top-Banner" },
  content: { label: "Texte", glyph: "TX", title: "Website-Texte" },
  menu: { label: "Menü", glyph: "WK", title: "Wochenkarte" },
};

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
      (["home", "course", "inbox", "banner", "content", "menu"] as const).map(
        (id) => ({
          id,
          label:
            id === "inbox" && unread > 0
              ? `${NAV_META[id].label} ${unread}`
              : NAV_META[id].label,
          glyph: NAV_META[id].glyph,
        }),
      ),
    [unread],
  );

  const installBlock = (
    <section className="admin-install-hero mb-5">
      <p className="admin-kicker !text-[color:var(--gold-soft)]">Web-App</p>
      <h2 className="font-display mt-2 text-2xl text-white md:text-[1.7rem]">
        {installed ? "App ist installiert" : "App jetzt herunterladen"}
      </h2>
      {installed ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
          Wassana Verwaltung läuft als App auf diesem Gerät — schnell öffnen,
          wie eine echte Laden-App.
        </p>
      ) : (
        <>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Speichere die Verwaltung auf dem Homescreen. Danach startet sie
            ohne Browser-Leiste — ideal fürs Handy im Laden.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {installEvent ? (
              <button
                type="button"
                className="btn-primary !bg-white !text-[color:var(--red)] hover:!bg-[color:var(--bg)]"
                onClick={() => void onInstall()}
              >
                App installieren
              </button>
            ) : (
              <span className="admin-chip !bg-white/12 !text-white">
                Bereit zum Speichern
              </span>
            )}
          </div>
          {!installEvent ? (
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              iPhone: Teilen → „Zum Home-Bildschirm“. Android: Menü → „App
              installieren“ / „Zum Startbildschirm“.
            </p>
          ) : null}
        </>
      )}
    </section>
  );

  return (
    <div className="admin-shell min-h-[100svh] text-[color:var(--ink)]">
      <header className="admin-topbar">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <div className="admin-brand-mark">
            <Image
              src="/admin/icon-192.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-[color:var(--red)]">
              Wassana Verwaltung
            </p>
            <p className="truncate text-xs text-[color:var(--muted)]">
              Laden-App · Banner, Menü, Anfragen
            </p>
          </div>
          {authed ? (
            <button
              type="button"
              className="btn-gold !px-3 !py-2 text-sm"
              onClick={onLogout}
            >
              Raus
            </button>
          ) : (
            <span className="admin-chip is-live">Live</span>
          )}
        </div>
      </header>

      <main className="admin-main mx-auto max-w-3xl px-4 pt-5">
        {checking ? (
          <div className="admin-login-card">
            <p className="admin-kicker">Laden</p>
            <p className="mt-2 font-display text-2xl text-[color:var(--red)]">
              Verwaltung startet …
            </p>
          </div>
        ) : !authed ? (
          <div className="space-y-5">
            {installBlock}
            <form onSubmit={onLogin} className="admin-login-card space-y-4">
              <p className="admin-kicker">Zugang</p>
              <h1 className="font-display text-3xl text-[color:var(--red)]">
                Anmelden
              </h1>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Danach steuerst du Kochkurs, Anfragen, Banner, Texte und die
                Wochenkarte — direkt als App.
              </p>
              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">
                  Passwort
                </span>
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
                {saving ? "Prüfen …" : "In die Verwaltung"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {!installed ? installBlock : null}

            {tab === "home" ? (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="admin-kicker">Dashboard</p>
                    <h1 className="font-display mt-1 text-3xl text-[color:var(--red)]">
                      Übersicht
                    </h1>
                  </div>
                  <span className="admin-chip is-live">
                    {unread > 0 ? `${unread} neu` : "aktuell"}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="admin-card"
                    onClick={() => setTab("course")}
                  >
                    <span className="admin-card-icon">KK</span>
                    <p className="mt-3 text-sm text-[color:var(--gold)]">
                      Kochkurs
                    </p>
                    <p className="mt-1 font-display text-xl text-[color:var(--red)]">
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
                    className="admin-card"
                    onClick={() => setTab("inbox")}
                  >
                    <span className="admin-card-icon">IN</span>
                    <p className="mt-3 text-sm text-[color:var(--gold)]">
                      Anfragen
                    </p>
                    <p className="mt-1 font-display text-xl text-[color:var(--red)]">
                      {unread > 0 ? `${unread} neu` : "Posteingang"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {inquiries.length} insgesamt
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card"
                    onClick={() => setTab("banner")}
                  >
                    <span className="admin-card-icon">BN</span>
                    <p className="mt-3 text-sm text-[color:var(--gold)]">
                      Top-Banner
                    </p>
                    <p className="mt-1 font-display text-xl text-[color:var(--red)]">
                      {content?.topBanner?.active ? "Sichtbar" : "Aus"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Mittagsangebot über dem Menü
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card"
                    onClick={() => setTab("content")}
                  >
                    <span className="admin-card-icon">TX</span>
                    <p className="mt-3 text-sm text-[color:var(--gold)]">
                      Website
                    </p>
                    <p className="mt-1 font-display text-xl text-[color:var(--red)]">
                      Texte ändern
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Hero, Zeiten, Schüler-Mittag …
                    </p>
                  </button>
                  <button
                    type="button"
                    className="admin-card sm:col-span-2"
                    onClick={() => setTab("menu")}
                  >
                    <span className="admin-card-icon">WK</span>
                    <p className="mt-3 text-sm text-[color:var(--gold)]">
                      Speisekarte
                    </p>
                    <p className="mt-1 font-display text-xl text-[color:var(--red)]">
                      Wochenkarte pflegen
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Mo–Fr Gerichte & Preise aktualisieren
                    </p>
                  </button>
                </div>
                <Link href="/" className="btn-gold inline-flex">
                  Öffentliche Website ansehen
                </Link>
              </section>
            ) : null}

            {tab === "course" ? (
              <form onSubmit={saveCourse} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Website-Widget"
                  title="Thai Kochkurs"
                  description="Termin und Texte für den Hinweis unten rechts auf der Website."
                />
                <Section title="Steuerung">
                  <Toggle
                    checked={course.active}
                    onChange={(active) =>
                      setCourse((c) => ({ ...c, active }))
                    }
                    label="Auf der Website anzeigen"
                    hint="Aus = Widget ausgeblendet"
                  />
                  <Field label="Datum">
                    <input
                      type="date"
                      value={course.date}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, date: e.target.value }))
                      }
                      className={fieldClass}
                      required
                    />
                  </Field>
                  <Field label="Titel">
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, title: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Thai Kochkurs / Pad Thai Abend"
                    />
                  </Field>
                  <Field label="Kurztext">
                    <input
                      type="text"
                      value={course.teaser}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, teaser: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Noch Plätze frei"
                    />
                  </Field>
                </Section>
                <StickySave saving={saving} label="Kochkurs speichern" />
              </form>
            ) : null}

            {tab === "inbox" ? (
              <section className="space-y-3">
                <ScreenHeader
                  kicker="Posteingang"
                  title="Anfragen"
                  description="Aus Kontakt, Catering und Kochkurs."
                  action={
                    unread > 0 ? (
                      <button
                        type="button"
                        className="btn-gold !px-3 !py-2 text-sm"
                        onClick={() => void markAllRead()}
                      >
                        Alle gelesen
                      </button>
                    ) : null
                  }
                />
                {inquiries.length === 0 ? (
                  <div className="admin-empty">Noch keine Anfragen.</div>
                ) : (
                  <ul className="admin-inbox-list">
                    {inquiries.map((item) => (
                      <li
                        key={item.id}
                        className={`admin-inbox-card ${
                          item.read ? "" : "is-unread"
                        }`}
                      >
                        <div className="admin-inbox-top">
                          <div className="min-w-0">
                            <p className="admin-kicker">
                              {item.subject}
                              {!item.read ? " · Neu" : ""}
                            </p>
                            <p className="mt-1 font-display text-lg text-[color:var(--red)]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-[color:var(--muted)]">
                              {formatWhen(item.createdAt)} · {item.source}
                            </p>
                          </div>
                          {!item.read ? (
                            <span className="admin-chip is-live">Neu</span>
                          ) : null}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-[color:var(--ink)]">
                          {item.message}
                        </p>
                        <div className="admin-inbox-actions">
                          <a href={`mailto:${item.email}`} className="btn-primary">
                            Mail
                          </a>
                          {item.phone ? (
                            <a href={`tel:${item.phone}`} className="btn-gold">
                              Anrufen
                            </a>
                          ) : null}
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
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {tab === "banner" && content ? (
              <form onSubmit={saveContent} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Top-Leiste"
                  title="Banner"
                  description="Über dem Menü auf allen Seiten — Text, Link und Farben."
                />
                <Section title="Inhalt">
                  <Toggle
                    checked={content.topBanner.active}
                    onChange={(active) =>
                      setContent({
                        ...content,
                        topBanner: { ...content.topBanner, active },
                      })
                    }
                    label="Banner anzeigen"
                    hint="Sofort auf der Website sichtbar"
                  />
                  <Field label="Text">
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
                  </Field>
                  <Field label="Hervorhebung (z. B. Preis)">
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
                  </Field>
                  <Field
                    label="Link-Ziel"
                    hint="#mittag öffnet das Angebot-Popup · sonst normale URL"
                  >
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
                      placeholder="#mittag"
                    />
                  </Field>
                  <Field label="Link-Text">
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
                  </Field>
                </Section>

                <Section title="Farben">
                  <div className="admin-color-row">
                    {BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="admin-swatch"
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
                    <label key={key} className="admin-color-pick">
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
                      />
                    </label>
                  ))}
                </Section>

                <div className="admin-preview" aria-hidden>
                  <p className="admin-preview-label">Vorschau</p>
                  <div
                    className="px-4 py-3 text-center text-sm"
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
                  className="btn-gold w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      topBanner: {
                        ...content.topBanner,
                        active: true,
                        text: `${content.studentLunch.eyebrow}: ${content.studentLunch.title}`,
                        highlight: content.studentLunch.price,
                        linkHref: "#mittag",
                        linkLabel: "Mehr",
                      },
                    })
                  }
                >
                  Aus Schüler-Mittag übernehmen
                </button>
                <StickySave saving={saving} label="Banner speichern" />
              </form>
            ) : null}

            {tab === "content" && content ? (
              <form onSubmit={saveContent} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Website"
                  title="Texte"
                  description="Alles, was auf der öffentlichen Seite steht — tippen und speichern."
                />
                <Section title="Hero Startseite">
                  <Field label="Begrüßung über Wassana">
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
                  </Field>
                  <Field label="Text unter Wassana">
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
                  </Field>
                </Section>

                <Section title="Bedeutung">
                  <Field label="Bedeutung „Wassana“">
                    <textarea
                      rows={3}
                      value={content.meaning}
                      onChange={(e) =>
                        setContent({ ...content, meaning: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>

                <Section title="Öffnungszeiten">
                  <Field label="Kurz (z. B. Mo–Fr …)">
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
                  </Field>
                  <Field label="Lang (Wochentage)">
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
                  </Field>
                  <Field label="Wochenende / Feiertage">
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
                  </Field>
                </Section>

                <Section title="Schüler-Mittag">
                  {(
                    [
                      ["eyebrow", "Überschrift klein"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                      ["price", "Preis"],
                      ["note", "Hinweis"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
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
                    </Field>
                  ))}
                </Section>

                <Section title="Mittag-Popup">
                  <p className="mb-2 text-sm text-[color:var(--muted)]">
                    Inhalt für Banner „Mehr“ und den Button auf der Startseite.
                    Auf dem Handy als Sheet von unten.
                  </p>
                  {(
                    [
                      ["popupTitle", "Popup-Titel"],
                      ["popupLead", "Kurztext oben"],
                      ["popupPrice", "Preis im Popup"],
                      ["popupNote", "Hinweis im Popup"],
                      ["popupCtaLabel", "Button-Text"],
                      ["popupCtaHref", "Button-Link"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
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
                    </Field>
                  ))}
                  <Field
                    label="Ausführlicher Text"
                    hint="Längere Erklärung im Popup"
                  >
                    <textarea
                      value={content.studentLunch.popupBody}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          studentLunch: {
                            ...content.studentLunch,
                            popupBody: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      rows={4}
                    />
                  </Field>
                  <Field
                    label="Punkte (eine Zeile = ein Punkt)"
                    hint="z. B. Softgetränk inklusive"
                  >
                    <textarea
                      value={content.studentLunch.popupBullets}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          studentLunch: {
                            ...content.studentLunch,
                            popupBullets: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      rows={5}
                    />
                  </Field>
                </Section>

                <Section title="Standort">
                  {(
                    [
                      ["eyebrow", "Kleine Zeile"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
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
                    </Field>
                  ))}
                </Section>

                <Section title="Abschluss">
                  <Field label="Titel">
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
                  </Field>
                  <Field
                    label="Text"
                    hint="Leer = Adresse + Zeiten automatisch"
                  >
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
                  </Field>
                </Section>
                <StickySave saving={saving} label="Texte speichern" />
              </form>
            ) : null}

            {tab === "menu" && weekly ? (
              <form onSubmit={saveWeekly} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Speisekarte"
                  title="Wochenkarte"
                  description="Pro Tag Gericht und Preise — mobil untereinander, am Desktop in einer Zeile."
                />
                <Section title="Allgemein">
                  <Field label="Hinweis unter dem Titel">
                    <input
                      value={weekly.note}
                      onChange={(e) =>
                        setWeekly({ ...weekly, note: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>

                {weekly.days.map((day, dayIndex) => (
                  <Section key={`${day.day}-${dayIndex}`} title={day.day}>
                    <Field label="Gericht">
                      <input
                        value={day.dish}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = { ...day, dish: e.target.value };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Beschreibung">
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
                    </Field>
                    <div className="admin-day-grid">
                      {day.items.map((item, itemIndex) => (
                        <div
                          key={`${item.nr}-${itemIndex}`}
                          className="admin-day-row"
                        >
                          <input
                            aria-label={`${day.day} Nr`}
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
                            placeholder="Nr"
                          />
                          <input
                            aria-label={`${day.day} Name`}
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
                            placeholder="Name"
                          />
                          <input
                            aria-label={`${day.day} Preis`}
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
                            placeholder="Preis"
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                ))}
                <StickySave saving={saving} label="Wochenkarte speichern" />
              </form>
            ) : null}

            {error ? (
              <p className="admin-toast is-error">{error}</p>
            ) : null}
            {status ? <p className="admin-toast">{status}</p> : null}
          </>
        )}
      </main>

      {authed ? (
        <nav className="admin-tabbar fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1 px-1.5 py-2 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError("");
                  setStatus("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  if (item.id === "inbox") void loadInbox();
                  if (item.id === "content" || item.id === "banner") {
                    void loadContent();
                  }
                  if (item.id === "menu") void loadWeekly();
                }}
                className={`admin-tab ${tab === item.id ? "is-active" : ""}`}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <span className="admin-tab-glyph">{item.glyph}</span>
                <span className="admin-tab-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
