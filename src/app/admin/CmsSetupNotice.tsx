"use client";

import { useState } from "react";
import { cmsHostingUrls } from "@/cms/config";

const TOKEN = "BLOB_READ_WRITE_TOKEN";

const STEPS = [
  {
    title: "Speicher öffnen",
    body: "Im Hosting auf „Storage“ gehen und den Blob-Store des Projekts öffnen. Ist noch keiner da: „Create“ → Blob → mit dem Projekt verbinden.",
    href: cmsHostingUrls.stores,
    linkLabel: "Storage öffnen",
  },
  {
    title: "Token kopieren",
    body: `Im Store auf den Reiter mit den Zugangsdaten. Dort steht der Read-Write-Token — einmal kopieren.`,
    href: null,
    linkLabel: null,
  },
  {
    title: "Als Variable eintragen",
    body: `Settings → Environment Variables → „Add“. Name exakt ${TOKEN}, Wert der kopierte Token, Umgebung Production ankreuzen. Speichern.`,
    href: cmsHostingUrls.env,
    linkLabel: "Variablen öffnen",
  },
  {
    title: "Neu veröffentlichen",
    body: "Deployments → beim obersten Eintrag „Redeploy“. Erst danach kennt die Website den Token.",
    href: cmsHostingUrls.deployments,
    linkLabel: "Deployments öffnen",
  },
] as const;

/**
 * Without the blob token nothing the owner saves survives — so the program
 * refuses to look healthy and walks through the one-time hosting setup instead.
 */
export function CmsSetupNotice({ onRecheck }: { onRecheck: () => void }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  async function copyName() {
    try {
      await navigator.clipboard.writeText(TOKEN);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="cms-setup" role="alert">
      <div className="cms-setup-head">
        <div>
          <p className="cms-setup-kicker">Einmalige Einrichtung</p>
          <h2 className="cms-setup-title">
            Änderungen gehen noch nicht auf die Website
          </h2>
          <p className="cms-setup-lead">
            Dem Projekt fehlt der Live-Speicher. Alles, was hier gespeichert
            wird, bleibt deshalb im Programm und erscheint nicht online. Vier
            Schritte im Hosting — danach läuft es dauerhaft.
          </p>
        </div>
        <button
          type="button"
          className="cms-setup-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {open ? "Einklappen" : "Anleitung zeigen"}
        </button>
      </div>

      {open ? (
        <>
          <ol className="cms-setup-steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="cms-setup-step">
                <span className="cms-setup-num" aria-hidden>
                  {index + 1}
                </span>
                <div className="cms-setup-copy">
                  <p className="cms-setup-step-title">{step.title}</p>
                  <p className="cms-setup-step-body">{step.body}</p>
                  {step.href ? (
                    <a
                      className="cms-setup-link"
                      href={step.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {step.linkLabel}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <div className="cms-setup-foot">
            <button type="button" className="cms-setup-copybtn" onClick={() => void copyName()}>
              {copied ? "Kopiert" : `${TOKEN} kopieren`}
            </button>
            <button type="button" className="btn-gold !px-4 !py-2 text-sm" onClick={onRecheck}>
              Fertig — jetzt prüfen
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
