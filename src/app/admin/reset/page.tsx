"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function AdminResetPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (password.length < 8) {
      setError("Mindestens 8 Zeichen.");
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (!token) {
      setError("Reset-Link ungültig. Bitte den Link aus der E-Mail öffnen.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          token,
          password,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Reset fehlgeschlagen.");
        return;
      }
      setDone(true);
      setStatus(data?.message || "Neues Passwort aktiv.");
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-shell min-h-[100svh] px-4 py-10 text-[color:var(--admin-ink)]">
      <div className="admin-login-card mx-auto max-w-md space-y-4">
        <p className="admin-kicker">Sicherheit</p>
        <h1 className="font-display text-3xl text-[color:var(--admin-burgundy)]">
          Neues Passwort
        </h1>
        {done ? (
          <>
            <p className="text-[color:var(--admin-muted)] leading-relaxed">
              {status}
            </p>
            <Link href="/admin" className="btn-primary inline-flex">
              Zur Anmeldung
            </Link>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3" autoComplete="on">
            <p className="text-sm text-[color:var(--admin-muted)] leading-relaxed">
              Link aus der Support-Mail nutzen. Danach gilt sofort das neue
              Passwort für `/admin`.
            </p>
            <label className="admin-field-wrap">
              <span className="admin-field-label">Neues Passwort</span>
              <input
                type="password"
                name="new-password"
                autoComplete="new-password"
                className="admin-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="admin-field-wrap">
              <span className="admin-field-label">Wiederholen</span>
              <input
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                className="admin-field"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </label>
            {error ? (
              <p className="text-sm text-[color:var(--admin-burgundy)]">{error}</p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Speichern …" : "Passwort setzen"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
