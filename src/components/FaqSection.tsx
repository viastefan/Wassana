import { Reveal } from "@/components/Reveal";
import type { SeoFaqItem } from "@/lib/seo-faq";

export function FaqSection({ items }: { items: SeoFaqItem[] }) {
  return (
    <section
      className="surface-section border-t"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-5 py-[var(--section-y)] md:px-8">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Landshut · FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display mt-3 text-3xl text-[color:var(--red)] md:text-4xl"
          >
            Häufige Fragen
          </h2>
          <p className="mt-3 max-w-xl text-[color:var(--muted)] leading-relaxed">
            Kurz und klar — für Gäste, die Wassana in Landshut suchen.
          </p>
        </Reveal>

        <div className="mt-10 divide-y divide-[color:var(--line)]">
          {items.map((item, index) => (
            <Reveal key={item.question} delay={(index % 3) as 0 | 1 | 2}>
              <details className="group py-5">
                <summary className="cursor-pointer list-none font-display text-xl text-[color:var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-[color:var(--gold)] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[color:var(--muted)] leading-relaxed">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
