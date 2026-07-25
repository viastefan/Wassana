"use client";

import { FormEvent, useState } from "react";
import { useBusiness } from "@/components/BusinessContext";

type ContactFormProps = {
  to?: string;
  subject?: string;
  title?: string;
  intro?: string;
  source?: string;
};

export function ContactForm({
  subject = "Anfrage über die Website",
  title = "Nachricht senden",
  intro = "Schreib uns kurz dein Anliegen — wir melden uns zurück.",
  source = "website",
}: ContactFormProps) {
  const business = useBusiness();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    setWarning("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          message: String(data.get("message") || "").trim(),
          subject,
          source,
          website: String(data.get("website") || ""),
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        warning?: string;
        ok?: boolean;
        mailGuestSent?: boolean;
      } | null;

      if (!res.ok) {
        setStatus("error");
        setError(payload?.error || "Senden fehlgeschlagen. Bitte später erneut versuchen.");
        return;
      }

      form.reset();
      if (payload?.warning) {
        setWarning(payload.warning);
      } else if (payload?.mailGuestSent === false) {
        setWarning(
          "Deine Anfrage ist angekommen — die automatische Bestätigungsmail konnte nicht gesendet werden.",
        );
      } else {
        setWarning("");
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Netzwerkfehler. Bitte später erneut versuchen oder anrufen.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl text-[color:var(--red)]">{title}</h2>
      <p className="mt-3 max-w-md text-[color:var(--muted)]">{intro}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {/* Honeypot */}
        <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>

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
        <button
          type="submit"
          className="btn-primary mt-2"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
        </button>

        {status === "sent" ? (
          <p className="text-sm leading-relaxed text-[color:var(--ink)]">
            Danke — deine Anfrage ist angekommen. Wir melden uns so bald wie
            möglich.
            {warning ? (
              <span className="mt-2 block text-[color:var(--muted)]">
                Hinweis: {warning}
              </span>
            ) : (
              <span className="mt-2 block text-[color:var(--muted)]">
                Du erhältst zusätzlich eine kurze Bestätigung per E-Mail.
              </span>
            )}
          </p>
        ) : null}

        {status === "error" ? (
          <p className="text-sm text-[color:var(--red)]">
            {error} Alternativ:{" "}
            <a
              href={business.emailHref}
              className="underline-offset-2 hover:underline"
            >
              {business.email}
            </a>{" "}
            oder{" "}
            <a
              href={business.phoneHref}
              className="underline-offset-2 hover:underline"
            >
              {business.phone}
            </a>
            .
          </p>
        ) : null}
      </form>
    </div>
  );
}
