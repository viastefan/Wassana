"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isStudentLunchPopupHref,
  type SiteContent,
} from "@/lib/site-content-shared";
import { EditableText } from "@/components/EditableText";
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
    banner.suffix,
  ].join("|")}`;
}

function isAdminPreview() {
  if (typeof window === "undefined") return false;
  return (
    new URLSearchParams(window.location.search).get("adminPreview") === "1"
  );
}

export function TopOfferBanner({
  banner,
  onVisibilityChange,
}: TopOfferBannerProps) {
  const offerPopup = useOfferPopupOptional();
  const storageKey = useMemo(() => bannerStorageKey(banner), [banner]);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setPreview(isAdminPreview());
    if (isAdminPreview()) {
      setDismissed(false);
      setReady(true);
      return;
    }
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [storageKey]);

  const configured = banner.active && Boolean(banner.text.trim());
  const visible = configured && (preview || !(ready && dismissed));

  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [visible, onVisibilityChange]);

  if (!configured) return null;
  if (!preview && ready && dismissed) return null;

  function dismiss(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (preview) return;
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
  const suffix = banner.suffix?.trim() || "";

  const copy = (
    <>
      <span className="min-w-0">
        <EditableText path="topBanner.text" as="span">
          {banner.text}
        </EditableText>
        {banner.highlight.trim() ? (
          <>
            {" "}
            <EditableText
              path="topBanner.highlight"
              as="span"
              className="font-semibold"
              style={{ color: banner.highlightColor }}
            >
              {banner.highlight}
            </EditableText>
          </>
        ) : null}
      </span>
      {hasAction ? (
        <EditableText
          path="topBanner.linkLabel"
          as="span"
          className="shrink-0 underline underline-offset-2 opacity-95"
          style={{ color: banner.highlightColor }}
        >
          {banner.linkLabel}
        </EditableText>
      ) : null}
      {suffix ? (
        <EditableText
          path="topBanner.suffix"
          as="span"
          className="top-offer-banner-suffix min-w-0 opacity-95"
        >
          {suffix}
        </EditableText>
      ) : null}
    </>
  );

  return (
    <div className="top-offer-banner" style={style} role="note">
      {opensPopup ? (
        <button
          type="button"
          className="top-offer-banner-copy block w-full transition hover:opacity-95"
          aria-label={`${banner.text}${suffix ? ` ${suffix}` : ""}`}
          data-admin-open-offer=""
          onClick={() => offerPopup?.openOffer()}
        >
          <div className="top-offer-banner-inner">{copy}</div>
        </button>
      ) : banner.linkHref.trim() ? (
        <a
          href={banner.linkHref}
          className="top-offer-banner-copy block transition hover:opacity-95"
          aria-label={`${banner.text}${suffix ? ` ${suffix}` : ""}`}
        >
          <div className="top-offer-banner-inner">{copy}</div>
        </a>
      ) : (
        <div className="top-offer-banner-copy">
          <div className="top-offer-banner-inner">{copy}</div>
        </div>
      )}

      {preview ? null : (
        <button
          type="button"
          className="top-offer-banner-close"
          aria-label="Angebot ausblenden"
          onClick={dismiss}
        >
          <span aria-hidden>×</span>
        </button>
      )}
    </div>
  );
}
