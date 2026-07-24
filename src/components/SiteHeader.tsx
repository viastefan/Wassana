"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);

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

  const solid = scrolled || open || !isHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
        solid
          ? "border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.jpg"
            alt="Wassana Thai Imbiss"
            width={48}
            height={48}
            className="h-11 w-11 rounded-full object-cover"
            priority
          />
          <span
            className={`font-display text-xl tracking-tight ${
              solid ? "text-[color:var(--red)]" : "text-white"
            }`}
          >
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-opacity hover:opacity-70 ${
                solid ? "text-[color:var(--ink)]" : "text-white/90"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/kontakt"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              solid
                ? "bg-[color:var(--red)] text-white hover:bg-[color:var(--red-hover)]"
                : "border border-white/40 text-white hover:bg-white/10"
            }`}
          >
            Kontakt
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className={`md:hidden ${solid ? "text-[color:var(--ink)]" : "text-white"}`}
          onClick={() => setOpen((v) => !v)}
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
        <div className="border-t border-[color:var(--line)] bg-[color:var(--bg)] px-5 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg text-[color:var(--ink)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href="/kontakt" className="btn-primary mt-2 w-fit">
              Kontakt
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
