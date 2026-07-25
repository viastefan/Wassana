import Link from "next/link";
import { MapEmbed } from "@/components/MapEmbed";
import { Reveal } from "@/components/Reveal";
import type { SiteContent } from "@/lib/site-content";
import { site } from "@/lib/site";

export function LocationSection({
  location,
  hours,
}: {
  location: SiteContent["location"];
  hours: SiteContent["hours"];
}) {
  return (
    <section
      id="standort"
      aria-labelledby="standort-heading"
      className="border-t border-[color:var(--line)] bg-[color:var(--paper)]"
    >
      <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
        <Reveal className="h-full">
          <div className="flex h-full flex-col justify-center px-5 py-14 md:px-8 md:py-16">
            <div>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                {location.eyebrow}
              </p>
              <h2
                id="standort-heading"
                className="font-display mt-3 text-3xl leading-tight text-[color:var(--red)] md:text-4xl"
              >
                {location.title}
              </h2>
              <p className="mt-4 max-w-sm text-[color:var(--muted)] leading-relaxed">
                {location.text}
              </p>

              <address className="mt-10 not-italic">
                <p className="text-lg text-[color:var(--ink)]">
                  <Link
                    href="/admin"
                    className="text-[color:var(--ink)] transition hover:text-[color:var(--ink)]"
                    title="Intern"
                    aria-label="Intern: Kochkurs verwalten"
                  >
                    {site.fullName}
                  </Link>
                </p>
                <p className="mt-2 text-[color:var(--muted)]">
                  {site.address.street}
                  <br />
                  {site.address.zip} {site.address.city}
                </p>
              </address>

              <dl className="mt-8 space-y-4">
                <div>
                  <dt className="text-sm tracking-[0.14em] text-[color:var(--gold)] uppercase">
                    Öffnungszeiten
                  </dt>
                  <dd className="mt-1 text-[color:var(--ink)]">
                    {hours.weekdaysLong}
                    <br />
                    <span className="text-[color:var(--muted)]">
                      {hours.weekend}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm tracking-[0.14em] text-[color:var(--gold)] uppercase">
                    Telefon
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={site.phoneHref}
                      className="text-[color:var(--ink)] transition hover:text-[color:var(--red)]"
                    >
                      {site.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={site.maps.directions}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Route planen
              </a>
              <a
                href={site.maps.place}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                In Google Maps
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1} className="h-full">
          <div className="flex h-full min-h-[340px] items-stretch border-t border-[color:var(--line)] md:min-h-0 md:border-t-0 md:py-16 md:pr-8">
            <div className="relative h-full min-h-[340px] w-full overflow-hidden md:rounded-sm">
              <MapEmbed
                title={`Karte: ${site.fullName}, ${site.address.street}, ${site.address.city}`}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
