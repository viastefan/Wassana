"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatCourseDate } from "@/lib/cooking-course-format";

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

type Tab = "course" | "inbox";

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

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("course");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unread, setUnread] = useState(0);
  const [inboxError, setInboxError] = useState("");
  const [course, setCourse] = useState<Course>({
    active: true,
    date: "",
    title: "Thai Kochkurs",
    teaser: "Noch Plätze frei",
  });

  const loadInbox = useCallback(async () => {
    setInboxError("");
    const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setInboxError("Anfragen konnten nicht geladen werden.");
      return;
    }
    const data = (await res.json()) as {
      inquiries: Inquiry[];
      unread: number;
    };
    setInquiries(data.inquiries || []);
    setUnread(data.unread || 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const courseRes = await fetch("/api/cooking-course", {
          cache: "no-store",
        });
        if (courseRes.ok) {
          const data = (await courseRes.json()) as Course;
          if (!cancelled) setCourse(data);
        }

        const probe = await fetch("/api/cooking-course", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ probe: true }),
        });
        // Logged in + invalid body → 400; logged out → 401
        if (!cancelled && probe.status === 400) {
          setAuthed(true);
          await loadInbox();
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadInbox]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
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
    await loadInbox();
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setInquiries([]);
    setUnread(0);
    setTab("course");
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveMessage("");
    const res = await fetch("/api/cooking-course", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    });
    const data = (await res.json().catch(() => null)) as
      | (Course & { error?: string })
      | null;
    setSaving(false);
    if (!res.ok) {
      if (res.status === 401) setAuthed(false);
      setSaveError(data?.error || "Speichern fehlgeschlagen.");
      return;
    }
    if (data) setCourse(data);
    setSaveMessage(
      `Gespeichert — Widget zeigt: Kochkurs am ${formatCourseDate(course.date)}`,
    );
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

  return (
    <main className="mx-auto min-h-[70svh] max-w-2xl px-5 pb-20 pt-28 md:px-8">
      <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
        Intern
      </p>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--red)]">
        Verwaltung
      </h1>
      <p className="mt-3 text-[color:var(--muted)] leading-relaxed">
        Kochkurs-Termin pflegen und eingehende Anfragen aus dem Kontaktformular
        lesen.
      </p>

      {checking ? (
        <p className="mt-10 text-sm text-[color:var(--muted)]">Laden …</p>
      ) : !authed ? (
        <form
          onSubmit={onLogin}
          className="mt-10 space-y-4 border-t border-[color:var(--line)] pt-8"
        >
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">Passwort</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-[color:var(--ink)] outline-none focus:border-[color:var(--red)]"
              required
            />
          </label>
          {loginError ? (
            <p className="text-sm text-[color:var(--red)]">{loginError}</p>
          ) : null}
          <button type="submit" className="btn-primary">
            Anmelden
          </button>
        </form>
      ) : (
        <div className="mt-10 border-t border-[color:var(--line)] pt-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("course")}
              className={`chip ${tab === "course" ? "bg-[color:var(--red)] text-white border-[color:var(--red)]" : ""}`}
            >
              Kochkurs
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("inbox");
                void loadInbox();
              }}
              className={`chip ${tab === "inbox" ? "bg-[color:var(--red)] text-white border-[color:var(--red)]" : ""}`}
            >
              Anfragen{unread > 0 ? ` (${unread})` : ""}
            </button>
            <button type="button" className="chip ml-auto" onClick={onLogout}>
              Abmelden
            </button>
            <Link href="/" className="chip">
              Zur Website
            </Link>
          </div>

          {tab === "course" ? (
            <form onSubmit={onSave} className="mt-8 space-y-5">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={course.active}
                  onChange={(e) =>
                    setCourse((c) => ({ ...c, active: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[color:var(--red)]"
                />
                <span className="text-[color:var(--ink)]">
                  Hinweis auf der Website anzeigen
                </span>
              </label>

              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">Datum</span>
                <input
                  type="date"
                  value={course.date}
                  onChange={(e) =>
                    setCourse((c) => ({ ...c, date: e.target.value }))
                  }
                  className="mt-2 w-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-[color:var(--ink)] outline-none focus:border-[color:var(--red)]"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">
                  Titel (Text auf dem Hinweis)
                </span>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) =>
                    setCourse((c) => ({ ...c, title: e.target.value }))
                  }
                  className="mt-2 w-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-[color:var(--ink)] outline-none focus:border-[color:var(--red)]"
                  placeholder="Thai Kochkurs"
                />
              </label>

              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">
                  Kurztext darunter
                </span>
                <input
                  type="text"
                  value={course.teaser}
                  onChange={(e) =>
                    setCourse((c) => ({ ...c, teaser: e.target.value }))
                  }
                  className="mt-2 w-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-[color:var(--ink)] outline-none focus:border-[color:var(--red)]"
                  placeholder="Noch Plätze frei"
                />
              </label>

              {course.date ? (
                <p className="border border-[color:var(--line)] bg-[color:var(--bg-soft)] px-4 py-3 text-sm text-[color:var(--muted)]">
                  Vorschau:{" "}
                  <strong className="text-[color:var(--ink)]">
                    {course.title}
                  </strong>
                  {course.teaser ? ` — ${course.teaser}` : null} am{" "}
                  {formatCourseDate(course.date)}
                </p>
              ) : null}

              {saveError ? (
                <p className="text-sm text-[color:var(--red)]">{saveError}</p>
              ) : null}
              {saveMessage ? (
                <p className="text-sm text-[color:var(--ink)]">{saveMessage}</p>
              ) : null}

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Speichern …" : "Aktualisieren & speichern"}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[color:var(--muted)]">
                  {inquiries.length === 0
                    ? "Noch keine Anfragen."
                    : `${inquiries.length} Anfrage${inquiries.length === 1 ? "" : "n"}${unread ? ` · ${unread} neu` : ""}`}
                </p>
                {unread > 0 ? (
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => void markAllRead()}
                  >
                    Alle als gelesen
                  </button>
                ) : null}
              </div>

              {inboxError ? (
                <p className="text-sm text-[color:var(--red)]">{inboxError}</p>
              ) : null}

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
                        <p className="mt-1 text-[color:var(--ink)]">
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
                          {formatWhen(item.createdAt)}
                          {item.source ? ` · ${item.source}` : ""}
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
                    <p className="mt-4 whitespace-pre-wrap text-[color:var(--ink)] leading-relaxed">
                      {item.message}
                    </p>
                    <p className="mt-3 text-xs text-[color:var(--muted)]">
                      Mail Inhaber: {item.mailOwnerSent ? "ja" : "nein"} · Mail
                      Absender: {item.mailGuestSent ? "ja" : "nein"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
