"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_STORAGE_KEY,
  parseConsent,
  type ConsentState,
} from "@/lib/consent";
import { useBusiness } from "@/components/BusinessContext";
import { useSitePages } from "@/components/SitePagesContext";

type MapEmbedProps = {
  title: string;
  src?: string;
};

export function MapEmbed({ title, src }: MapEmbedProps) {
  const business = useBusiness();
  const pages = useSitePages();
  const map = pages.chrome.map;
  const mapSrc = src || business.maps.embed;
  const [mapsAllowed, setMapsAllowed] = useState(false);

  useEffect(() => {
    function apply(state: ConsentState | null) {
      setMapsAllowed(Boolean(state?.maps));
    }

    apply(parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)));

    function onConsent(event: Event) {
      const detail = (event as CustomEvent<ConsentState>).detail;
      apply(detail);
    }

    window.addEventListener("wassana-consent", onConsent);
    return () => window.removeEventListener("wassana-consent", onConsent);
  }, []);

  function acceptMaps() {
    const next: ConsentState = {
      necessary: true,
      maps: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("wassana-consent", { detail: next }),
    );
    setMapsAllowed(true);
  }

  if (!mapsAllowed) {
    return (
      <div className="map-consent absolute inset-0 flex flex-col items-start justify-end bg-[color:var(--bg-soft)] p-6 md:p-8">
        <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
          {map.kicker}
        </p>
        <p className="mt-3 max-w-sm text-[color:var(--ink)] leading-relaxed">
          {map.consentText}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={acceptMaps}>
            {map.load}
          </button>
          <a
            href={business.maps.place}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            {map.openExternal}
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
