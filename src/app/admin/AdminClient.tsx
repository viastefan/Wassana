"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { formatCourseDate } from "@/lib/cooking-course-format";

type Course = {
  active: boolean;
  date: string;
  title: string;
  teaser: string;
  updatedAt?: string;
};

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course>({
    active: true,
    date: "",
    title: "Thai Kochkurs",
    teaser: "Noch Plätze frei",
  });

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
        if (!cancelled && probe.status === 400) setAuthed(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

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
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
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

  return (
    <main className="mx-auto min-h-[70svh] max-w-lg px-5 pb-20 pt-28 md:px-8">
      <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
        Intern
      </p>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--red)]">
        Kochkurs verwalten
      </h1>
      <p className="mt-3 text-[color:var(--muted)] leading-relaxed">
        Anmelden, Termin und Texte ändern, speichern — der Hinweis unten rechts
        auf der Website aktualisiert sich danach.
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
        <form
          onSubmit={onSave}
          className="mt-10 space-y-5 border-t border-[color:var(--line)] pt-8"
        >
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
              <strong className="text-[color:var(--ink)]">{course.title}</strong>
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

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Speichern …" : "Aktualisieren & speichern"}
            </button>
            <button type="button" className="btn-gold" onClick={onLogout}>
              Abmelden
            </button>
            <Link href="/" className="btn-gold">
              Zur Website
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
