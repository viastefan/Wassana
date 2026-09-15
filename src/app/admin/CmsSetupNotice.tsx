"use client";

import { cmsHostingUrls } from "@/cms/config";

/**
 * Without a Blob store attached to the project, nothing the owner saves
 * survives — so the program says so plainly instead of failing on save.
 * Attaching the store sets BLOB_READ_WRITE_TOKEN itself; there is no
 * token to copy anywhere.
 */
export function CmsSetupNotice({ onRecheck }: { onRecheck: () => void }) {
  return (
    <section className="cms-setup" role="alert">
      <p className="cms-setup-kicker">Einmalig einrichten</p>
      <h2 className="cms-setup-title">Speicher noch nicht verbunden</h2>
      <p className="cms-setup-lead">
        Ohne Speicher bleibt jede Änderung hier in der App und erscheint nicht
        auf der Website. Zwei Klicks im Hosting, dann läuft es dauerhaft.
      </p>

      <ol className="cms-setup-steps">
        <li className="cms-setup-step">
          <span className="cms-setup-num" aria-hidden>
            1
          </span>
          <div className="cms-setup-copy">
            <p className="cms-setup-step-title">Speicher anlegen</p>
            <p className="cms-setup-step-body">
              Auf <em>Create Database</em> → <em>Blob</em> → dem Projekt
              zuweisen. Mehr ist nicht nötig, der Zugang wird dabei automatisch
              gesetzt.
            </p>
            <a
              className="cms-setup-link"
              href={cmsHostingUrls.stores}
              target="_blank"
              rel="noreferrer"
            >
              Speicher öffnen
            </a>
          </div>
        </li>
        <li className="cms-setup-step">
          <span className="cms-setup-num" aria-hidden>
            2
          </span>
          <div className="cms-setup-copy">
            <p className="cms-setup-step-title">Website neu veröffentlichen</p>
            <p className="cms-setup-step-body">
              Beim obersten Eintrag auf <em>Redeploy</em>. Erst danach kennt die
              Website den neuen Speicher.
            </p>
            <a
              className="cms-setup-link"
              href={cmsHostingUrls.deployments}
              target="_blank"
              rel="noreferrer"
            >
              Veröffentlichungen öffnen
            </a>
          </div>
        </li>
      </ol>

      <div className="cms-setup-foot">
        <button type="button" className="btn-gold !px-4 !py-2 text-sm" onClick={onRecheck}>
          Fertig — jetzt prüfen
        </button>
      </div>
    </section>
  );
}
