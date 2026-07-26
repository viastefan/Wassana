"use client";

import { useEffect, useState } from "react";
import {
  createConsent,
  persistConsent,
  readStoredConsent,
  type ConsentState,
} from "@/lib/consent";
import { useBusiness } from "@/components/BusinessContext";

type MapEmbedProps = {
  title: string;
  src?: string;
};

export function MapEmbed({ title, src }: MapEmbedProps) {
  const business = useBusiness();
  const mapSrc = src || business.maps.embed;
  const [mapsAllowed, setMapsAllowed] = useState(false);

  useEffect(() => {
    function apply(state: ConsentState | null) {
      setMapsAllowed(Boolean(state?.maps));
    }

    apply(readStoredConsent());

    function onConsent(event: Event) {
      const detail = (event as CustomEvent<ConsentState>).detail;
      apply(detail ?? readStoredConsent());
    }

    window.addEventListener("wassana-consent", onConsent);
    return () => window.removeEventListener("wassana-consent", onConsent);
  }, []);

  function acceptMaps() {
    const next = persistConsent(createConsent(true));
    setMapsAllowed(next.maps);
  }

  if (!mapsAllowed) {
    return (
      <div className="map-consent absolute inset-0 flex flex-col items-start justify-end bg-[color:var(--bg-soft)] p-6 md:p-8">
        <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
          Karte
        </p>
        <p className="mt-3 max-w-sm text-[color:var(--ink)] leading-relaxed">
          Google Maps wird erst nach Zustimmung geladen (Datenschutz).
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={acceptMaps}>
            Karte laden
          </button>
          <a
            href={business.maps.place}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            In Google Maps öffnen
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <iframe
        title={title}
        src={mapSrc}
        className="location-map absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div
        className="pointer-events-none absolute inset-0 location-map-veil"
        aria-hidden
      />
    </>
  );
}
