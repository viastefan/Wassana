import type { ReactNode } from "react";
import { JsonLdBreadcrumbs } from "@/components/JsonLd";
import { MediaBand } from "@/components/Media";
import { Reveal } from "@/components/Reveal";

export function ContentPage({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  children,
}: {
  breadcrumbs: { name: string; path: string }[];
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
}) {
  return (
    <main>
      <JsonLdBreadcrumbs items={breadcrumbs} />
      <MediaBand
        src={image}
        alt={imageAlt}
        eyebrow={eyebrow}
        title={title}
        text={lead}
        priority
        height="short"
      />
      <section className="surface-section border-b">
        <div className="mx-auto max-w-3xl px-5 py-[var(--section-y)] md:px-8">
          <Reveal>
            <div className="space-y-8 text-[color:var(--muted)] leading-relaxed">
              {children}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl text-[color:var(--ink)] md:text-3xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
