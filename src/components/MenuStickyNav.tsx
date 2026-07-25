"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [activeId, setActiveId] = useState(anchors[0]?.id ?? "wochenkarte");

  useEffect(() => {
    const nodes = anchors
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        const top = visible[0];
        if (top?.target?.id) setActiveId(top.target.id);
      },
      {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    nodes.forEach((node) => observer.observe(node));

    function onHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && anchors.some((item) => item.id === hash)) {
        setActiveId(hash);
      }
    }
    onHash();
    window.addEventListener("hashchange", onHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [anchors]);

  return (
    <div className="menu-sticky sticky z-20 -mx-5 mb-8 border-b border-[color:var(--line)] px-5 py-3 md:-mx-8 md:mb-10 md:px-8">
      <div className="menu-sticky-row">
        <div className="menu-sticky-chips" role="navigation" aria-label="Menü-Kategorien">
          {anchors.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`chip${activeId === item.id ? " is-active" : ""}`}
              aria-current={activeId === item.id ? "true" : undefined}
              onClick={() => setActiveId(item.id)}
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
