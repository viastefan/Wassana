"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useBusiness } from "@/components/BusinessContext";
import { site } from "@/lib/site";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/catering", label: "Catering" },
  { href: "/kochkurs", label: "Kochkurs" },
] as const;

export function SiteHeader({
  embedded = false,
  hours,
}: {
  embedded?: boolean;
  hours?: { weekdays: string };
}) {
  const business = useBusiness();
  const hoursLabel = hours?.weekdays?.trim() || site.hours.weekdays;
  const pathname = usePathname();
  const contactActions = [
    {
      href: "/kontakt",
      label: "Kontaktanfrage",
      hint: "Formular schreiben",
    },
    {
      href: business.emailHref,
      label: "E-Mail",
      hint: business.email,
      external: true,
    },
    {
      href: business.phoneHref,
      label: "Anrufen",
      hint: business.phone,
      external: true,
    },
  ] as const;
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const contactMenuId = useId();

  useEffect(() => {
    setOpen(false);
    setContactOpen(false);
    setMobileContactOpen(false);
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

  useEffect(() => {
    if (!contactOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!contactRef.current?.contains(event.target as Node)) {
        setContactOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setContactOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [contactOpen]);

  // Auf der Startseite oben: transparent + weiße Schrift
  const onHero = isHome && !scrolled && !open;
  const solid = !onHero;

  return (
    <header
      className={`${
        embedded ? "relative w-full" : "fixed inset-x-0 top-0 z-50"
      } transition-all duration-400 ${
        onHero ? "site-header-hero bg-transparent" : ""
      } ${
        solid
          ? "border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 backdrop-blur-md"
          : ""
      }`}
    >
      <div className="site-header-bar mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Wassana Thai Imbiss"
            width={56}
            height={56}
            className="h-12 w-12 rounded-full object-contain bg-[color:var(--paper)] p-0.5 ring-1 ring-[color:var(--gold-soft)]/50 md:h-[3.25rem] md:w-[3.25rem]"
            priority
          />
          <span
            className={`nav-brand font-display text-xl tracking-tight md:text-[1.35rem] ${
              solid ? "text-[color:var(--red)]" : ""
            }`}
          >
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-sm tracking-wide transition-opacity hover:opacity-70 ${
                solid ? "text-[color:var(--ink)]" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="contact-menu" ref={contactRef}>
            <button
              type="button"
              className={`${
                solid ? "btn-primary" : "btn-ghost"
              } contact-menu-trigger px-4 py-2 text-sm`}
              aria-expanded={contactOpen}
              aria-controls={contactMenuId}
              aria-haspopup="menu"
              onClick={() => setContactOpen((v) => !v)}
            >
              Kontakt
              <span className="contact-menu-caret" aria-hidden>
                ▾
              </span>
            </button>

            <div
              id={contactMenuId}
              role="menu"
              aria-label="Kontaktoptionen"
              className={`contact-menu-panel ${contactOpen ? "is-open" : ""}`}
            >
              {contactActions.map((action) =>
                "external" in action && action.external ? (
                  <a
                    key={action.label}
                    href={action.href}
                    role="menuitem"
                    className="contact-menu-item"
                    onClick={() => setContactOpen(false)}
                  >
                    <span className="contact-menu-item-label">{action.label}</span>
                    <span className="contact-menu-item-hint">{action.hint}</span>
                  </a>
                ) : (
                  <Link
                    key={action.label}
                    href={action.href}
                    role="menuitem"
                    className="contact-menu-item"
                    onClick={() => setContactOpen(false)}
                  >
                    <span className="contact-menu-item-label">{action.label}</span>
                    <span className="contact-menu-item-hint">{action.hint}</span>
                  </Link>
                ),
              )}
            </div>
          </div>
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
              <li
                style={{
                  transitionDelay: open
                    ? `${80 + navItems.length * 45}ms`
                    : "0ms",
                }}
              >
                <button
                  type="button"
                  className={`mobile-nav-link mobile-nav-contact-toggle ${
                    pathname === "/kontakt" || mobileContactOpen
                      ? "is-active"
                      : ""
                  }`}
                  tabIndex={open ? 0 : -1}
                  aria-expanded={mobileContactOpen}
                  onClick={() => setMobileContactOpen((v) => !v)}
                >
                  <span className="mobile-nav-index">
                    0{navItems.length + 1}
                  </span>
                  <span>Kontakt</span>
                  <span className="mobile-nav-caret" aria-hidden>
                    {mobileContactOpen ? "▴" : "▾"}
                  </span>
                </button>
                <div
                  className={`mobile-contact-panel ${
                    mobileContactOpen ? "is-open" : ""
                  }`}
                >
                  <div className="mobile-contact-panel-inner">
                    {contactActions.map((action) =>
                      "external" in action && action.external ? (
                        <a
                          key={action.label}
                          href={action.href}
                          className="mobile-contact-item"
                          tabIndex={open && mobileContactOpen ? 0 : -1}
                          onClick={() => setOpen(false)}
                        >
                          <span>{action.label}</span>
                          <span>{action.hint}</span>
                        </a>
                      ) : (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="mobile-contact-item"
                          tabIndex={open && mobileContactOpen ? 0 : -1}
                          onClick={() => setOpen(false)}
                        >
                          <span>{action.label}</span>
                          <span>{action.hint}</span>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              </li>
            </ul>
            <p className="mobile-nav-meta">
              {hoursLabel}
              <span aria-hidden> · </span>
              <a href={business.phoneHref}>{business.phone}</a>
            </p>
          </nav>
        </div>
      </div>
    </header>
  );
}
