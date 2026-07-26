"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Preset = { src: string; label: string };

export async function uploadAdminImage(
  file: File,
  folder: string,
): Promise<{ url: string } | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body,
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };
    if (!res.ok || !data.url) {
      return { error: data.error || "Upload fehlgeschlagen." };
    }
    return { url: data.url };
  } catch {
    return { error: "Upload fehlgeschlagen (Netzwerk)." };
  }
}

export function AdminImageField({
  value,
  onChange,
  presets = [],
  allowEmpty = true,
  folder,
  hint,
}: {
  value: string;
  onChange: (next: string) => void;
  presets?: readonly Preset[];
  allowEmpty?: boolean;
  folder: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isPreset = presets.some((item) => item.src === value);
  const isCustom = Boolean(value) && !isPreset;
  const emptySelected = allowEmpty && !value;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    const result = await uploadAdminImage(file, folder);
    setUploading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onChange(result.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="admin-image-field">
      {hint ? (
        <p className="mb-2 text-sm text-[color:var(--admin-muted)]">{hint}</p>
      ) : null}

      <div className="admin-image-grid">
        {allowEmpty ? (
          <button
            type="button"
            className={`admin-image-option admin-image-option--empty ${
              emptySelected ? "is-selected" : ""
            }`}
            onClick={() => {
              setError("");
              onChange("");
            }}
            aria-pressed={emptySelected}
          >
            <span className="admin-image-empty-preview" aria-hidden>
              —
            </span>
            <span>Kein Bild</span>
          </button>
        ) : null}

        {presets.map((option) => {
          const selected = value === option.src;
          return (
            <button
              key={option.src}
              type="button"
              className={`admin-image-option ${selected ? "is-selected" : ""}`}
              onClick={() => {
                setError("");
                onChange(option.src);
              }}
              aria-pressed={selected}
            >
              <Image
                src={option.src}
                alt={option.label}
                width={160}
                height={100}
                className="admin-image-option-img"
              />
              <span>{option.label}</span>
            </button>
          );
        })}

        {isCustom ? (
          <button
            type="button"
            className="admin-image-option is-selected"
            onClick={() => onChange(value)}
            aria-pressed
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Eigenes Bild"
              className="admin-image-option-img"
            />
            <span>Eigenes Bild</span>
          </button>
        ) : null}
      </div>

      <div className="admin-image-upload-row">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          id={`admin-upload-${folder}`}
          disabled={uploading}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <label
          htmlFor={`admin-upload-${folder}`}
          className={`btn-gold admin-image-upload-btn ${
            uploading ? "is-disabled" : ""
          }`}
        >
          {uploading ? "Wird hochgeladen …" : "Eigenes Bild hochladen"}
        </label>
        {isCustom || value ? (
          <button
            type="button"
            className="btn-gold"
            disabled={uploading || !value}
            onClick={() => {
              setError("");
              onChange("");
            }}
          >
            Bild entfernen
          </button>
        ) : null}
      </div>

      {error ? <p className="admin-toast is-error mt-2">{error}</p> : null}
    </div>
  );
}
