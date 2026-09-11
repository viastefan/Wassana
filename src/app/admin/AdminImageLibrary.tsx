"use client";

import { useState } from "react";
import type { SiteContent, SiteImageKey } from "@/lib/site-content-shared";
import { SITE_IMAGE_FIELDS, isRemoteCmsSrc } from "@/lib/site-content-shared";
import { Field, Section } from "./ui";

export function AdminImageLibrary({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
}) {
  const [busyKey, setBusyKey] = useState<SiteImageKey | null>(null);
  const [error, setError] = useState("");

  async function onFile(key: SiteImageKey, file: File | undefined) {
    if (!file) return;
    setBusyKey(key);
    setError("");
    try {
      const body = new FormData();
      body.set("key", key);
      body.set("file", file);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body,
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        setError(data?.error || "Upload fehlgeschlagen.");
        return;
      }
      setContent({
        ...content,
        images: { ...content.images, [key]: data.url },
      });
    } catch {
      setError("Netzwerkfehler beim Bild-Upload.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <Section title="Bilder austauschen">
      <p className="mb-3 text-sm text-[color:var(--admin-muted)]">
        Foto wählen, dann unten „Texte veröffentlichen“ — gilt sofort auf der
        Website.
      </p>
      {error ? <p className="admin-toast is-error mb-3">{error}</p> : null}
      <div className="admin-media-grid">
        {SITE_IMAGE_FIELDS.map((field) => {
          const src = content.images?.[field.key] || "";
          return (
            <article key={field.key} className="admin-media-card">
              <div className="admin-media-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="admin-media-preview-img"
                />
              </div>
              <Field label={field.label} hint={field.hint}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={busyKey === field.key}
                  className="admin-file"
                  onChange={(e) =>
                    void onFile(field.key, e.target.files?.[0])
                  }
                />
              </Field>
              {isRemoteCmsSrc(src) ? (
                <p className="text-xs text-[color:var(--admin-ok)]">
                  Eigenes Foto gespeichert
                </p>
              ) : (
                <p className="text-xs text-[color:var(--admin-muted)]">
                  Standardfoto
                </p>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
