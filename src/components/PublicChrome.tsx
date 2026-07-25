"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CookieBanner } from "@/components/CookieBanner";
import { CookingCoursePromo } from "@/components/CookingCoursePromo";
import { OfferPopup } from "@/components/OfferPopup";
import { OfferPopupProvider } from "@/components/OfferPopupContext";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopOfferBanner } from "@/components/TopOfferBanner";
import type { SiteContent } from "@/lib/site-content-shared";

export function PublicChrome({
  children,
  content,
}: {
  children: React.ReactNode;
  content: SiteContent;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const bannerConfigured =
    content.topBanner.active && Boolean(content.topBanner.text.trim());
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerVisible, setBannerVisible] = useState(bannerConfigured);
  const [bannerH, setBannerH] = useState(bannerConfigured ? 40 : 0);

  const onBannerVisibilityChange = useCallback((visible: boolean) => {
    setBannerVisible(visible);
    if (!visible) setBannerH(0);
  }, []);

  useEffect(() => {
    if (!bannerVisible) {
      setBannerH(0);
      return;
    }
    const node = bannerRef.current;
    if (!node) return;

    const update = () =>
      setBannerH(Math.ceil(node.getBoundingClientRect().height));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [bannerVisible, content.topBanner]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <OfferPopupProvider offer={content.studentLunch}>
      <div
        className={`site-shell${bannerVisible ? " has-top-banner" : ""}`}
        style={
          {
            ["--banner-h" as string]: `${bannerH}px`,
          } as React.CSSProperties
        }
      >
        <a href="#main-content" className="skip-link">
          Zum Inhalt springen
        </a>
        <div className="site-top-chrome">
          {bannerConfigured ? (
            <div ref={bannerRef}>
              <TopOfferBanner
                banner={content.topBanner}
                onVisibilityChange={onBannerVisibilityChange}
              />
            </div>
          ) : null}
          <SiteHeader embedded />
        </div>
        <div id="main-content">{children}</div>
        <SiteFooter hours={content.hours} />
        <CookingCoursePromo />
        <CookieBanner />
        <OfferPopup />
      </div>
    </OfferPopupProvider>
  );
}
