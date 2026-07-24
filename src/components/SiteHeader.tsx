"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#kurse", label: "Kurse" },
  { href: "#termine", label: "Termine" },
  { href: "#ueber", label: "Über" },
  { href: "#kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[color:var(--paper)]/90 shadow-[0_1px_0_var(--line)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#top"
          className={`font-display text-2xl tracking-tight transition-colors ${
            scrolled ? "text-ink" : "text-white"
          }`}
        >
          Wassana
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-opacity hover:opacity-70 ${
                scrolled ? "text-ink" : "text-white/90"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#termine"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              scrolled
                ? "bg-accent text-white hover:bg-accent-hover"
                : "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            }`}
          >
            Platz sichern
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className={`md:hidden ${scrolled ? "text-ink" : "text-white"}`}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menü</span>
          <div className="flex h-6 w-7 flex-col justify-center gap-1.5">
            <span
              className={`h-px w-full bg-current transition ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-full bg-current transition ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#termine"
              className="mt-2 inline-flex w-fit rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={() => setOpen(false)}
            >
              Platz sichern
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
