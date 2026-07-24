import { allergens, menuSections, weeklyMenu } from "@/lib/menu";
import { Reveal } from "@/components/Reveal";

function ItemRow({
  nr,
  name,
  description,
  price,
  allergens: codes,
}: {
  nr?: string;
  name: string;
  description?: string;
  price: string;
  allergens?: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 gap-y-1 border-b border-[color:var(--line)] py-4 last:border-b-0">
      <span className="min-w-8 text-sm text-[color:var(--gold)]">{nr}</span>
      <div>
        <p className="text-[color:var(--ink)]">
          {name}
          {codes ? (
            <sup className="ml-1 text-[0.65rem] text-[color:var(--muted)]">
              {codes}
            </sup>
          ) : null}
        </p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <span className="whitespace-nowrap text-sm font-medium text-[color:var(--red)]">
        {price}
      </span>
    </div>
  );
}

export function Speisekarte() {
  return (
    <section id="speisekarte" className="bg-[color:var(--bg)]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Speisekarte
          </p>
          <h2 className="font-display mt-3 text-4xl text-[color:var(--red)] md:text-5xl">
            Wochenkarte & Speisen
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted)]">
            Authentische Curries, Wok-Gerichte und Suppen — frisch zubereitet,
            gerne auch zum Mitnehmen.
          </p>
        </Reveal>

        <div className="mt-14">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-display text-3xl text-[color:var(--ink)]">
                Wochenkarte
              </h3>
              <p className="text-sm text-[color:var(--muted)]">{weeklyMenu.note}</p>
            </div>
            <div className="gold-rule mt-4" />
          </Reveal>

          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {weeklyMenu.days.map((day, index) => (
              <Reveal key={day.day} delay={(index % 3) as 0 | 1 | 2}>
                <article className="border-t border-[color:var(--gold-soft)] pt-5">
                  <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                    {day.day}
                  </p>
                  <h4 className="font-display mt-2 text-2xl text-[color:var(--red)]">
                    {day.dish}
                  </h4>
                  {"description" in day && day.description ? (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {day.description}
                      {"allergens" in day && day.allergens ? (
                        <sup className="ml-1 text-[0.65rem]">{day.allergens}</sup>
                      ) : null}
                    </p>
                  ) : null}
                  <div className="mt-4 space-y-2">
                    {day.items.map((item) => (
                      <div
                        key={`${day.day}-${item.nr}-${item.name}`}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span>
                          <span className="text-[color:var(--gold)]">{item.nr}</span>{" "}
                          {item.name}
                          {"allergens" in item && item.allergens ? (
                            <sup className="ml-1 text-[0.65rem] text-[color:var(--muted)]">
                              {item.allergens}
                            </sup>
                          ) : null}
                        </span>
                        <span className="whitespace-nowrap text-[color:var(--red)]">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 space-y-16">
          {menuSections.map((section) => (
            <Reveal key={section.id}>
              <div>
                <h3 className="font-display text-3xl text-[color:var(--ink)]">
                  {section.title}
                </h3>
                {section.note ? (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {section.note}
                  </p>
                ) : null}
                <div className="gold-rule mt-4" />
                <div className="mt-2">
                  {section.items.map((item, idx) => (
                    <ItemRow
                      key={`${section.id}-${item.nr}-${idx}`}
                      nr={item.nr}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      allergens={item.allergens}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 border-t border-[color:var(--line)] pt-8">
            <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
              Hinweise
            </p>
            <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
              Wir bieten fünf Schärfegrade: nicht scharf – leicht scharf –
              mittelscharf – scharf – sehr scharf. Bitte bei der Bestellung
              angeben. Extra Soße im Becher: 0,10 €. Getränke mit * inkl. 0,15 €
              Pfand.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {allergens.map((item) => (
                <p key={item.code} className="text-sm text-[color:var(--muted)]">
                  <span className="text-[color:var(--gold)]">{item.code})</span>{" "}
                  {item.label}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
