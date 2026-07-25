"use client";

import { useSitePages } from "@/components/SitePagesContext";

export function CookieSettingsButton() {
  const pages = useSitePages();
  return (
    <button
      type="button"
      className="hover:text-[color:var(--red)]"
      onClick={() => window.dispatchEvent(new Event("wassana-open-consent"))}
    >
      {pages.chrome.footer.cookies}
    </button>
  );
}
