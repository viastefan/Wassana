"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { AllergenLegend } from "@/components/AllergenLegend";
import { MenuPdfDownload } from "@/components/MenuPdfDownload";
import type { MenuSection } from "@/lib/menu";

export function MenuStickyNav({ sections }: { sections: MenuSection[] }) {
  const anchors = useMemo(
    () => [
      { id: "wochenkarte", label: "Beliebte Gerichte" },
      ...sections.map((section) => ({
        id: section.id,
        label: section.title,
      })),
    ],
    [sections],
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && anchors.some((item) => item.id === hash)) {
        setActiveId(hash);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [anchors]);

  function goTo(id: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setActiveId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}#${id}`);
  }

  return (
    <div className="menu-sticky sticky z-20 -mx-5 mb-8 border-b border-[color:var(--line)] px-5 py-3 md:-mx-8 md:mb-10 md:px-8">
      <div className="menu-sticky-row">
        <div
          className="menu-sticky-chips"
          role="navigation"
          aria-label="Menü-Kategorien"
        >
          {anchors.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`chip${activeId === item.id ? " is-active" : ""}`}
              aria-current={activeId === item.id ? "true" : undefined}
              onClick={(event) => goTo(item.id, event)}
            >
              {item.label}
            </a>
          ))}
          <AllergenLegend variant="chip" />
        </div>
        <MenuPdfDownload
          className="btn-gold menu-sticky-pdf"
          label="Als PDF"
        />
      </div>
    </div>
  );
}
