"use client";

import { usePathname } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { CookingCoursePromo } from "@/components/CookingCoursePromo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter hours={content.hours} />
      <CookingCoursePromo />
      <CookieBanner />
    </div>
  );
}
