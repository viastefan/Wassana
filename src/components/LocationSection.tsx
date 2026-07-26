"use client";

import Image from "next/image";
import Link from "next/link";
import { MapEmbed } from "@/components/MapEmbed";
import { Reveal } from "@/components/Reveal";
import { useBusiness } from "@/components/BusinessContext";
import type { SiteContent } from "@/lib/site-content-shared";

export function LocationSection({
  location,
  hours,
}: {
  location: SiteContent["location"];
  hours: SiteContent["hours"];
}) {
  const business = useBusiness();
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
                    rel="nofollow"
                    className="text-[color:var(--ink)] transition hover:text-[color:var(--ink)]"
                    title="Intern"
                    aria-label="Intern: Kochkurs verwalten"
                  >
                    {business.fullName}
                  </Link>
                </p>
                <p className="mt-2 text-[color:var(--muted)]">
                  {business.street}
                  <br />
                  {business.zip} {business.city}
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
                      href={business.phoneHref}
                      className="text-[color:var(--ink)] transition hover:text-[color:var(--red)]"
                    >
                      {business.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={business.maps.directions}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Route planen
              </a>
              <a
                href={business.maps.place}
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
          <div className="location-visual flex h-full flex-col border-t border-[color:var(--line)] md:border-t-0 md:py-16 md:pr-8">
            <div className="location-photo relative min-h-[260px] flex-1 overflow-hidden md:min-h-[320px] md:rounded-sm">
              <Image
                src="/images/shop-interior.jpg"
                alt={`Innenraum von ${business.fullName} am ${business.street} in ${business.city}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="location-map-panel relative mt-3 h-[200px] overflow-hidden border-t border-[color:var(--line)] md:mt-4 md:h-[220px] md:rounded-sm md:border md:border-[color:var(--line)]">
              <MapEmbed
                title={`Karte: ${business.fullName}, ${business.street}, ${business.city}`}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
