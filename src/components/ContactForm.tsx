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
      <h2 className="font-display text-2xl text-[color:var(--red)] md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--muted)] md:mt-3 md:text-base">
        {intro}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 md:mt-8 md:space-y-5">
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

        <label className="field-wrap">
          <span className="field-label">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="field"
            placeholder="Dein Name"
          />
        </label>
        <label className="field-wrap">
          <span className="field-label">E-Mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="field"
            placeholder="name@mail.de"
          />
        </label>
        <label className="field-wrap">
          <span className="field-label">
            Telefon <span className="field-label-hint">(optional)</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className="field"
            placeholder="0871 …"
          />
        </label>
        <label className="field-wrap">
          <span className="field-label">Nachricht</span>
          <textarea
            name="message"
            required
            rows={4}
            className="field"
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
