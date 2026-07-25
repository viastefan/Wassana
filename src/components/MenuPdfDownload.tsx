"use client";

import { useState } from "react";

export function MenuPdfDownload({
  className = "btn-gold",
  label = "Als PDF speichern",
  busyLabel = "PDF wird erstellt …",
}: {
  className?: string;
  label?: string;
  busyLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/menu-pdf", { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Download fehlgeschlagen.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Wassana-Speisekarte-Landshut.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="menu-pdf-download">
      <button
        type="button"
        className={className}
        onClick={() => void download()}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? busyLabel : label}
      </button>
      {error ? (
        <span className="menu-pdf-error" role="status">
          {error}
        </span>
      ) : null}
    </span>
  );
}
