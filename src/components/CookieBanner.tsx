"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useSitePages } from "@/components/SitePagesContext";
import {
  CONSENT_STORAGE_KEY,
  createConsent,
  parseConsent,
  type ConsentState,
} from "@/lib/consent";

function emitConsent(state: ConsentState) {
  window.dispatchEvent(
    new CustomEvent("wassana-consent", { detail: state }),
  );
}

function renderCookieLead(
  lead: string,
  privacyLabel: string,
  imprintLabel: string,
): ReactNode[] {
  const parts = lead.split(/\{(privacy|imprint)\}/g);
  return parts.map((part, index) => {
    if (part === "privacy") {
      return (
        <Link
          key={`privacy-${index}`}
          href="/datenschutz"
          className="text-[color:var(--red)] underline-offset-2 hover:underline"
        >
          {privacyLabel}
        </Link>
      );
    }
    if (part === "imprint") {
      return (
        <Link
          key={`imprint-${index}`}
          href="/impressum"
          className="text-[color:var(--red)] underline-offset-2 hover:underline"
        >
          {imprintLabel}
        </Link>
      );
    }
    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}

export function CookieBanner() {
  const pages = useSitePages();
  const cookie = pages.chrome.cookie;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (!existing) {
      setVisible(true);
      document.documentElement.classList.add("has-cookie-banner");
    }

    function onOpenSettings() {
      setVisible(true);
      document.documentElement.classList.add("has-cookie-banner");
    }
    window.addEventListener("wassana-open-consent", onOpenSettings);
    return () => {
      window.removeEventListener("wassana-open-consent", onOpenSettings);
    };
  }, []);

  function save(maps: boolean) {
    const state = createConsent(maps);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    emitConsent(state);
    document.documentElement.classList.remove("has-cookie-banner");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
    >
      <div className="cookie-banner-inner">
        <div className="min-w-0 flex-1">
          <p
            id="cookie-banner-title"
            className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase"
          >
            {cookie.title}
          </p>
          <p
            id="cookie-banner-text"
            className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]"
          >
            {renderCookieLead(
              cookie.lead,
              cookie.privacyLabel,
              cookie.imprintLabel,
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-gold !px-4 !py-2.5 text-sm"
            onClick={() => save(false)}
          >
            {cookie.btnNecessary}
          </button>
          <button
            type="button"
            className="btn-primary !px-4 !py-2.5 text-sm"
            onClick={() => save(true)}
          >
            {cookie.btnAcceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
