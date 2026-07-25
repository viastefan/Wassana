"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultSitePages,
  type SitePages,
} from "@/lib/site-pages-shared";

const SitePagesContext = createContext<SitePages>(defaultSitePages());

export function SitePagesProvider({
  pages,
  children,
}: {
  pages: SitePages;
  children: ReactNode;
}) {
  return (
    <SitePagesContext.Provider value={pages}>
      {children}
    </SitePagesContext.Provider>
  );
}

export function useSitePages(): SitePages {
  return useContext(SitePagesContext);
}
