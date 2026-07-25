"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/catering", label: "Catering" },
  { href: "/kochkurs", label: "Kochkurs" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auf der Startseite oben: transparent + weiße Schrift
  const onHero = isHome && !scrolled && !open;
  const solid = !onHero;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
        onHero ? "site-header-hero bg-transparent" : ""
      } ${
        solid
          ? "border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 backdrop-blur-md"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Wassana Thai Imbiss"
            width={48}
            height={48}
            className="h-11 w-11 rounded-full object-contain bg-[color:var(--paper)] p-0.5"
            priority
          />
          <span
            className={`nav-brand font-display text-xl tracking-tight ${
              solid ? "text-[color:var(--red)]" : ""
            }`}
          >
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((link) =>
            link.href === "/kontakt" ? (
              <Link
                key={link.href}
                href={link.href}
                className={
                  solid
                    ? "btn-primary px-4 py-2 text-sm"
                    : "btn-ghost px-4 py-2 text-sm"
                }
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-sm tracking-wide transition-opacity hover:opacity-70 ${
                  solid ? "text-[color:var(--ink)]" : ""
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className={`nav-toggle md:hidden ${
            solid ? "text-[color:var(--ink)]" : ""
          }`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <div className="flex h-6 w-7 flex-col justify-center gap-1.5">
            <span
              className={`h-px w-full bg-current transition duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-full bg-current transition duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      <div
        className={`mobile-nav md:hidden ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-nav-clip">
          <nav className="mobile-nav-panel" aria-label="Mobilnavigation">
            <div className="gold-rule mb-8" />
            <ul className="mobile-nav-list">
              {navItems.map((link, index) => (
                <li
                  key={link.href}
                  style={{
                    transitionDelay: open ? `${80 + index * 45}ms` : "0ms",
                  }}
                >
                  <Link
                    href={link.href}
                    className={`mobile-nav-link ${
                      pathname === link.href ? "is-active" : ""
                    }`}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mobile-nav-index">0{index + 1}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mobile-nav-meta">
              {site.hours.weekdays}
              <span aria-hidden> · </span>
              <a href={site.phoneHref}>{site.phone}</a>
            </p>
          </nav>
        </div>
      </div>
    </header>
  );
}
