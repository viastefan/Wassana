"use client";

import { FormEvent, useState } from "react";
import { site } from "@/lib/site";

type ContactFormProps = {
  to?: string;
  subject?: string;
  title?: string;
  intro?: string;
};

export function ContactForm({
  to = site.email,
  subject = "Anfrage über die Website",
  title = "Nachricht senden",
  intro = "Schreib uns kurz dein Anliegen — wir melden uns zurück.",
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "ready">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus("ready");
  }

  return (
    <div>
      <h2 className="font-display text-3xl text-[color:var(--red)]">{title}</h2>
      <p className="mt-3 max-w-md text-[color:var(--muted)]">{intro}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-3 outline-none transition focus:border-[color:var(--red)]"
            placeholder="Dein Name"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">E-Mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-3 outline-none transition focus:border-[color:var(--red)]"
            placeholder="name@mail.de"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">
            Telefon <span className="text-[color:var(--gold)]">(optional)</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-3 outline-none transition focus:border-[color:var(--red)]"
            placeholder="0871 …"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">Nachricht</span>
          <textarea
            name="message"
            required
            rows={4}
            className="w-full resize-y border-b border-[color:var(--line)] bg-transparent py-3 outline-none transition focus:border-[color:var(--red)]"
            placeholder="Dein Anliegen"
          />
        </label>
        <button type="submit" className="btn-primary mt-2">
          E-Mail öffnen
        </button>
        {status === "ready" ? (
          <p className="text-sm text-[color:var(--muted)]">
            Dein E-Mail-Programm sollte sich öffnen. Alternativ direkt an{" "}
            <a href={`mailto:${to}`} className="text-[color:var(--red)] underline-offset-2 hover:underline">
              {to}
            </a>{" "}
            schreiben oder anrufen:{" "}
            <a href={site.phoneHref} className="text-[color:var(--red)] underline-offset-2 hover:underline">
              {site.phone}
            </a>
            .
          </p>
        ) : null}
      </form>
    </div>
  );
}
