"use client";

import Image from "next/image";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { CookingCourseFooterDock } from "@/components/CookingCoursePromo";
import { useBusiness } from "@/components/BusinessContext";
import { site } from "@/lib/site";

type SiteFooterProps = {
  hours?: {
    weekdaysLong: string;
    weekend: string;
  };
};

const exploreLinks = [
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/mitnehmen", label: "Mitnehmen" },
  { href: "/catering", label: "Catering" },
  { href: "/kochkurs", label: "Kochkurs" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/anfahrt", label: "Anfahrt" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function SiteFooter({ hours }: SiteFooterProps) {
  const business = useBusiness();
  const weekdaysLong = hours?.weekdaysLong || site.hours.weekdaysLong;
  const weekend = hours?.weekend || site.hours.weekend;

  return (
    <footer className="site-footer border-t border-[color:var(--line)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt=""
              width={64}
              height={64}
              className="h-14 w-14 rounded-full object-contain bg-[color:var(--paper)] p-0.5"
            />
            <span className="font-display text-3xl text-[color:var(--red)]">
              {site.name}
            </span>
          </Link>
          <p className="mt-2 text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
            {site.tagline}
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[color:var(--muted)]">
            <Link
              href="/admin"
              rel="nofollow"
              className="text-[color:var(--muted)] transition hover:text-[color:var(--muted)]"
              title="Intern"
              aria-label="Intern: Verwaltung"
            >
              {business.fullName}
            </Link>
            <br />
            Inhaber: {business.owner}
            <br />
            {business.street}
            <br />
            {business.zip} {business.city}
          </p>
        </div>

        <div>
          <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
            Entdecken
          </p>
          <div className="mt-3 flex flex-col gap-2 text-[color:var(--ink)]">
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[color:var(--red)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
            Öffnungszeiten
          </p>
          <p className="mt-3 text-[color:var(--ink)]">{weekdaysLong}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{weekend}</p>
          <Link
            href="/anfahrt"
            className="mt-5 inline-block text-sm text-[color:var(--red)] underline-offset-4 hover:underline"
          >
            Anfahrt & Karte
          </Link>
        </div>

        <div>
          <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
            Kontakt
          </p>
          <div className="mt-3 flex flex-col gap-2 text-[color:var(--ink)]">
            <a
              href={business.phoneHref}
              className="hover:text-[color:var(--red)]"
            >
              {business.phone}
            </a>
            <a
              href={business.emailHref}
              className="hover:text-[color:var(--red)]"
            >
              {business.email}
            </a>
            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)]"
            >
              Instagram {business.instagramHandle}
            </a>
            <Link href="/kontakt" className="hover:text-[color:var(--red)]">
              Kontaktformular
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-sm text-[color:var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} {business.fullName}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={business.maps.directions}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)]"
            >
              Route
            </a>
            <Link href="/impressum" className="hover:text-[color:var(--red)]">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-[color:var(--red)]">
              Datenschutz
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
        <CookingCourseFooterDock />
      </div>
    </footer>
  );
}
