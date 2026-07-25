import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

type TopOfferBannerProps = {
  banner: SiteContent["topBanner"];
};

export function TopOfferBanner({ banner }: TopOfferBannerProps) {
  if (!banner.active || !banner.text.trim()) return null;

  const inner = (
    <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[0.82rem] leading-snug tracking-wide md:px-8 md:text-sm">
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
      {banner.linkLabel.trim() && banner.linkHref.trim() ? (
        <span
          className="shrink-0 underline underline-offset-2 opacity-95"
          style={{ color: banner.highlightColor }}
        >
          {banner.linkLabel}
        </span>
      ) : null}
    </div>
  );

  const style = {
    backgroundColor: banner.backgroundColor,
    color: banner.textColor,
  } as const;

  if (banner.linkHref.trim()) {
    return (
      <div className="top-offer-banner" style={style}>
        <Link
          href={banner.linkHref}
          className="block transition hover:opacity-95"
          aria-label={banner.text}
        >
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className="top-offer-banner" style={style} role="note">
      {inner}
    </div>
  );
}
