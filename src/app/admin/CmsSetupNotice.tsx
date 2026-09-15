"use client";

import { cmsHostingUrls } from "@/cms/config";

/**
 * Without a working Blob store, nothing the owner saves survives on .de.
 */
export function CmsSetupNotice({
  onRecheck,
  suspended = false,
}: {
  onRecheck: () => void;
  suspended?: boolean;
}) {
  return (
    <section className="cms-setup" role="alert">
      <p className="cms-setup-kicker">
        {suspended ? "Speicher gesperrt" : "Einmalig einrichten"}
      </p>
      <h2 className="cms-setup-title">
        {suspended
          ? "Live-Speicher ist blockiert"
          : "Speicher noch nicht verbunden"}
      </h2>
      <p className="cms-setup-lead">
        {suspended
          ? "Vercel hat den alten Speicher gesperrt. Deshalb geht die Speisekarte nicht live. Einen neuen Blob anlegen und der Website zuweisen — zwei Klicks."
          : "Ohne Speicher bleibt jede Änderung hier in der App und erscheint nicht auf der Website. Zwei Klicks im Hosting, dann läuft es dauerhaft."}
      </p>

      <ol className="cms-setup-steps">
        <li className="cms-setup-step">
          <span className="cms-setup-num" aria-hidden>
            1
          </span>
          <div className="cms-setup-copy">
            <p className="cms-setup-step-title">Neuen Blob anlegen</p>
            <p className="cms-setup-step-body">
              {suspended ? (
                <>
                  Oben <em>Create Database</em> → <em>Blob</em>. Dem Projekt{" "}
                  <em>wassana</em> zuweisen (Production). Der alte gesperrte
                  Store darf bleiben.
                </>
              ) : (
                <>
                  Auf <em>Create Database</em> → <em>Blob</em> → dem Projekt
                  zuweisen. Mehr ist nicht nötig, der Zugang wird dabei
                  automatisch gesetzt.
                </>
              )}
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
