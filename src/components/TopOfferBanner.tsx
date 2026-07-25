"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isStudentLunchPopupHref,
  type SiteContent,
} from "@/lib/site-content-shared";
import { useOfferPopupOptional } from "@/components/OfferPopupContext";

type TopOfferBannerProps = {
  banner: SiteContent["topBanner"];
  onVisibilityChange?: (visible: boolean) => void;
};

function bannerStorageKey(banner: SiteContent["topBanner"]) {
  return `wassana-top-banner-dismissed:${[
    banner.text,
    banner.highlight,
    banner.linkHref,
    banner.linkLabel,
  ].join("|")}`;
}

export function TopOfferBanner({
  banner,
  onVisibilityChange,
}: TopOfferBannerProps) {
  const offerPopup = useOfferPopupOptional();
  const storageKey = useMemo(() => bannerStorageKey(banner), [banner]);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [storageKey]);

  const configured = banner.active && Boolean(banner.text.trim());
  const visible = configured && !(ready && dismissed);

  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [visible, onVisibilityChange]);

  if (!configured) return null;
  if (ready && dismissed) return null;

  function dismiss(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  }

  const style = {
    backgroundColor: banner.backgroundColor,
    color: banner.textColor,
  } as const;

  const opensPopup = isStudentLunchPopupHref(banner.linkHref);
  const hasAction =
    Boolean(banner.linkLabel.trim()) &&
    (opensPopup || Boolean(banner.linkHref.trim()));

  const copy = (
    <>
      <span className="min-w-0">
        <span>{banner.text}</span>
        {banner.highlight.trim() ? (
          <>
            {" "}
            <span
              className="font-semibold whitespace-nowrap"
              style={{ color: banner.highlightColor }}
            >
              {banner.highlight}
            </span>
          </>
        ) : null}
      </span>
      {hasAction ? (
        <span
          className="shrink-0 underline underline-offset-2 opacity-95"
          style={{ color: banner.highlightColor }}
        >
          {banner.linkLabel}
        </span>
      ) : null}
    </>
  );

  return (
    <div className="top-offer-banner relative" style={style} role="note">
      {opensPopup ? (
        <button
          type="button"
          className="top-offer-banner-copy block w-full transition hover:opacity-95"
          aria-label={banner.text}
          onClick={() => offerPopup?.openOffer()}
        >
          <div className="top-offer-banner-inner">{copy}</div>
        </button>
      ) : banner.linkHref.trim() ? (
        <a
          href={banner.linkHref}
          className="top-offer-banner-copy block transition hover:opacity-95"
          aria-label={banner.text}
        >
          <div className="top-offer-banner-inner">{copy}</div>
        </a>
      ) : (
        <div className="top-offer-banner-copy">
          <div className="top-offer-banner-inner">{copy}</div>
        </div>
      )}

      <button
        type="button"
        className="top-offer-banner-close"
        aria-label="Angebot ausblenden"
        onClick={dismiss}
      >
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
