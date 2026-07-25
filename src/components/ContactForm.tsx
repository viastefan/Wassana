"use client";

import { FormEvent, useState } from "react";
import { useBusiness } from "@/components/BusinessContext";
import { useSitePages } from "@/components/SitePagesContext";

type ContactFormProps = {
  to?: string;
  subject?: string;
  title?: string;
  intro?: string;
  source?: string;
};

export function ContactForm({
  subject,
  title,
  intro,
  source = "website",
}: ContactFormProps) {
  const business = useBusiness();
  const pages = useSitePages();
  const form = pages.contactForm;
  const resolvedTitle = title ?? form.defaultTitle;
  const resolvedIntro = intro ?? form.defaultIntro;
  const resolvedSubject = subject ?? pages.kontakt.formSubject;
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

    const formEl = event.currentTarget;
    const data = new FormData(formEl);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          message: String(data.get("message") || "").trim(),
          subject: resolvedSubject,
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
        setError(payload?.error || form.errorSend);
        return;
      }

      formEl.reset();
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
      setError(form.errorNetwork);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-[color:var(--red)] md:text-3xl">
        {resolvedTitle}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--muted)] md:mt-3 md:text-base">
        {resolvedIntro}
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

        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">
            {form.nameLabel}
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-2.5 outline-none transition focus:border-[color:var(--red)] md:py-3"
            placeholder="Dein Name"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">
            {form.emailLabel}
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-2.5 outline-none transition focus:border-[color:var(--red)] md:py-3"
            placeholder="name@mail.de"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">
            {form.phoneLabel}
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className="w-full border-b border-[color:var(--line)] bg-transparent py-2.5 outline-none transition focus:border-[color:var(--red)] md:py-3"
            placeholder="0871 …"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted)]">
            {form.messageLabel}
          </span>
          <textarea
            name="message"
            required
            rows={4}
            className="w-full resize-y border-b border-[color:var(--line)] bg-transparent py-2.5 outline-none transition focus:border-[color:var(--red)] md:py-3"
            placeholder="Dein Anliegen"
          />
        </label>
        <button
          type="submit"
          className="btn-primary mt-2"
          disabled={status === "sending"}
        >
          {status === "sending" ? form.sending : form.submit}
        </button>

        {status === "sent" ? (
          <p className="text-sm leading-relaxed text-[color:var(--ink)]">
            {form.sent}
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
