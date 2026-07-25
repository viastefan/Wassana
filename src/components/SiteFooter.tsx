import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--bg-soft)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-contain bg-[color:var(--paper)] p-0.5"
            />
            <span className="font-display text-3xl text-[color:var(--red)]">
              {site.name}
            </span>
          </Link>
          <p className="mt-2 text-sm tracking-[0.18em] text-[color:var(--gold)] uppercase">
            {site.tagline}
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[color:var(--muted)]">
            {site.fullName}
            <br />
            Inh.: {site.owner}
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </p>
        </div>

        <div>
          <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
            Öffnungszeiten
          </p>
          <p className="mt-3 text-[color:var(--ink)]">{site.hours.weekdaysLong}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{site.hours.weekend}</p>
          <a
            href={site.maps.place}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block text-sm text-[color:var(--red)] underline-offset-4 hover:underline"
          >
            Google Maps
          </a>
        </div>

        <div>
          <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
            Kontakt
          </p>
          <div className="mt-3 flex flex-col gap-2 text-[color:var(--ink)]">
            <a href={site.phoneHref} className="hover:text-[color:var(--red)]">
              {site.phone}
            </a>
            <a href={site.emailHref} className="hover:text-[color:var(--red)]">
              {site.email}
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)]"
            >
              Instagram {site.social.instagramHandle}
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
            © {new Date().getFullYear()} {site.fullName}
          </p>
          <div className="flex gap-5">
            <a
              href={site.maps.directions}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)]"
            >
              Route
            </a>
            <Link href="/impressum" className="hover:text-[color:var(--red)]">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
