import Link from "next/link";
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
    <div className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 gap-y-1 border-b border-[color:var(--line)] py-4 last:border-b-0">
      <span className="text-sm text-[color:var(--gold)]">{nr || "–"}</span>
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

export function Wochenkarte({ compact = false }: { compact?: boolean }) {
  return (
    <section id="wochenkarte" className={compact ? "" : "bg-[color:var(--bg)]"}>
      <div className={compact ? "" : "mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24"}>
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Diese Woche
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl text-[color:var(--red)] md:text-5xl">
              Wochenkarte
            </h2>
            <p className="text-sm text-[color:var(--muted)]">{weeklyMenu.note}</p>
          </div>
          <div className="gold-rule mt-5" />
        </Reveal>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {weeklyMenu.days.map((day, index) => (
            <Reveal key={day.day} delay={(index % 3) as 0 | 1 | 2}>
              <article className="h-full border-t border-[color:var(--gold-soft)] pt-5">
                <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                  {day.day}
                </p>
                <h3 className="font-display mt-2 text-2xl text-[color:var(--ink)]">
                  {day.dish}
                </h3>
                {"description" in day && day.description ? (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {day.description}
                  </p>
                ) : null}
                <div className="mt-4 space-y-2">
                  {day.items.map((item) => (
                    <div
                      key={`${day.day}-${item.nr}-${item.name}`}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="text-[color:var(--ink)]">
                        <span className="text-[color:var(--gold)]">{item.nr}</span>{" "}
                        {item.name}
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

        {compact ? (
          <Reveal>
            <div className="mt-10">
              <Link href="/speisekarte" className="btn-primary">
                Zur vollständigen Speisekarte
              </Link>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export function SpeisekarteFull() {
  return (
    <section className="bg-[color:var(--bg)]">
      <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="sticky top-[4.5rem] z-20 -mx-5 mb-10 border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 px-5 py-3 backdrop-blur-md md:-mx-8 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <a href="#wochenkarte" className="chip">
              Wochenkarte
            </a>
            {menuSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="chip">
                {section.title}
              </a>
            ))}
          </div>
        </div>

        <Wochenkarte />

        <div className="mt-8 space-y-16">
          {menuSections.map((section) => (
            <Reveal key={section.id}>
              <div id={section.id}>
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
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--muted)]">
              Schärfe nach Wunsch: nicht scharf – leicht scharf – mittelscharf –
              scharf – sehr scharf. Extra Soße 0,10 €. Getränke mit * inkl.
              0,15 € Pfand.
            </p>
            <div className="mt-5 grid gap-1 sm:grid-cols-2">
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
