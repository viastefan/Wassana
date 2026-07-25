"use client";

import { usePathname } from "next/navigation";
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
      <SiteHeader />
      {children}
      <SiteFooter hours={content.hours} />
      <CookingCoursePromo />
    </div>
  );
}
