"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CookieBanner } from "@/components/CookieBanner";
import { CookingCoursePromo } from "@/components/CookingCoursePromo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopOfferBanner } from "@/components/TopOfferBanner";
import type { SiteContent } from "@/lib/site-content";

export function PublicChrome({
  children,
  content,
}: {
  children: React.ReactNode;
  content: SiteContent;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const bannerOn =
    content.topBanner.active && Boolean(content.topBanner.text.trim());
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerH, setBannerH] = useState(bannerOn ? 40 : 0);

  useEffect(() => {
    if (!bannerOn) {
      setBannerH(0);
      return;
    }
    const node = bannerRef.current;
    if (!node) return;

    const update = () => setBannerH(Math.ceil(node.getBoundingClientRect().height));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [bannerOn, content.topBanner]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      className={`site-shell${bannerOn ? " has-top-banner" : ""}`}
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
        {bannerOn ? (
          <div ref={bannerRef}>
            <TopOfferBanner banner={content.topBanner} />
          </div>
        ) : null}
        <SiteHeader embedded />
      </div>
      <div id="main-content">{children}</div>
      <SiteFooter hours={content.hours} />
      <CookingCoursePromo />
      <CookieBanner />
    </div>
  );
}
