"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** iOS-NavigationStack-Feeling: jede Seite gleitet weich ein. */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
