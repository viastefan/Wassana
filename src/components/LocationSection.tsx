import { site } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export function LocationSection() {
  return (
    <section
      id="standort"
      aria-labelledby="standort-heading"
      className="border-t border-[color:var(--line)]"
    >
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between px-5 py-14 md:px-8 md:py-20">
            <div>
              <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
                Hier findest du uns
              </p>
              <h2
                id="standort-heading"
                className="font-display mt-3 text-3xl leading-tight text-[color:var(--red)] md:text-4xl"
              >
                Regierungsplatz, Landshut
              </h2>
              <p className="mt-4 max-w-sm text-[color:var(--muted)] leading-relaxed">
                Im Gewerbehaus am Regierungsplatz — frisch kochen, abholen,
                genießen.
              </p>

              <address className="mt-10 not-italic">
                <p className="text-lg text-[color:var(--ink)]">
                  {site.fullName}
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
                    {site.hours.weekdaysLong}
                    <br />
                    <span className="text-[color:var(--muted)]">
                      {site.hours.weekend}
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

        <Reveal delay={1}>
          <div className="relative min-h-[340px] overflow-hidden border-t border-[color:var(--line)] md:min-h-[480px] md:border-t-0 md:border-l">
            <iframe
              title={`Karte: ${site.fullName}, ${site.address.street}, ${site.address.city}`}
              src={site.maps.embed}
              className="location-map absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div
              className="pointer-events-none absolute inset-0 location-map-veil"
              aria-hidden
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
