import Link from "next/link";
import type { ReactNode } from "react";
import { AllergenLegend, AllergenMarks } from "@/components/AllergenLegend";
import { DishInfoButton } from "@/components/DishInfoButton";
import { MenuPdfDownload } from "@/components/MenuPdfDownload";
import { allergens, type MenuSection } from "@/lib/menu";
import { Reveal } from "@/components/Reveal";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store";

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
          <AllergenMarks codes={codes} />
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

function Motion({
  animate,
  delay = 0,
  children,
}: {
  animate: boolean;
  delay?: 0 | 1 | 2;
  children: ReactNode;
}) {
  if (!animate) return <>{children}</>;
  return <Reveal delay={delay}>{children}</Reveal>;
}

export function Wochenkarte({
  compact = false,
  menu,
  animate = true,
}: {
  compact?: boolean;
  menu: WeeklyMenuData;
  /** Scroll/reveal animations — off on Speisekarte page */
  animate?: boolean;
}) {
  return (
    <section id="wochenkarte" className={compact ? "" : "bg-[color:var(--bg)]"}>
      <div className={compact ? "" : "mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24"}>
        <Motion animate={animate}>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Diese Woche bei Wassana
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl text-[color:var(--red)] md:text-5xl">
              Beliebte Gerichte der Woche
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[color:var(--muted)]">{menu.note}</p>
              {!compact ? <AllergenLegend variant="link" /> : null}
            </div>
          </div>
          <div className="gold-rule mt-5" />
        </Motion>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {menu.days.map((day, index) => (
            <Motion
              key={`${day.day}-${index}`}
              animate={animate}
              delay={(index % 3) as 0 | 1 | 2}
            >
              <article className="h-full border-t border-[color:var(--gold-soft)] px-4 pt-5 sm:px-0">
                <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                  {day.day}
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <h3 className="font-display text-2xl text-[color:var(--ink)]">
                    {day.dish}
                    <AllergenMarks codes={day.allergens} />
                  </h3>
                  <DishInfoButton day={day} />
                </div>
                {day.description ? (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {day.description}
                  </p>
                ) : null}
                {day.kcal || day.protein || day.fat || day.carbs ? (
                  <p className="dish-nutrition-inline mt-2">
                    {[
                      day.kcal ? `${day.kcal} kcal` : null,
                      day.protein ? `E ${day.protein}` : null,
                      day.fat ? `F ${day.fat}` : null,
                      day.carbs ? `KH ${day.carbs}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
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
                        <AllergenMarks codes={item.allergens} />
                      </span>
                      <span className="whitespace-nowrap text-[color:var(--red)]">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </Motion>
          ))}
        </div>

        {compact ? (
          <Motion animate={animate}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/speisekarte" className="btn-primary">
                Zur vollständigen Speisekarte
              </Link>
              <AllergenLegend variant="link" />
            </div>
          </Motion>
        ) : null}
      </div>
    </section>
  );
}

export function SpeisekarteFull({
  menu,
  sections,
}: {
  menu: WeeklyMenuData;
  sections: MenuSection[];
}) {
  return (
    <section className="bg-[color:var(--bg)]">
      <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="menu-sticky sticky z-20 -mx-5 mb-8 border-b border-[color:var(--line)] px-5 py-3 md:-mx-8 md:mb-10 md:px-8">
          <div className="menu-sticky-row">
            <div className="menu-sticky-chips">
              <a href="#wochenkarte" className="chip">
                Beliebte Gerichte
              </a>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="chip">
                  {section.title}
                </a>
              ))}
              <AllergenLegend variant="chip" />
            </div>
            <MenuPdfDownload
              className="btn-gold menu-sticky-pdf"
              label="Als PDF"
            />
          </div>
        </div>

        <Wochenkarte menu={menu} animate={false} />

        <div className="mt-8 space-y-16">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
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
          ))}
        </div>

        <div
          id="kennzeichnung"
          className="allergen-legend-block mt-16 border-t border-[color:var(--line)] pt-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm tracking-[0.16em] text-[color:var(--gold)] uppercase">
                Hinweise & Kennzeichnung
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--muted)]">
                Hochgestellte Zeichen neben den Gerichten stehen für Zusatzstoffe
                und Allergene. Schärfe nach Wunsch: nicht scharf – leicht scharf –
                mittelscharf – scharf – sehr scharf. Extra Soße 0,10 €. Getränke
                mit * inkl. 0,15 € Pfand.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AllergenLegend variant="button" />
              <MenuPdfDownload
                className="btn-primary"
                label="Als PDF speichern"
              />
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {allergens.map((item) => (
              <p key={item.code} className="text-sm text-[color:var(--muted)]">
                <span className="allergen-code">{item.code}</span> {item.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
