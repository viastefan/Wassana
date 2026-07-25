import Image from "next/image";
import type { ReactNode } from "react";

type MediaBandProps = {
  /** Empty/undefined = text-only band (layout adapts, no decorative photo). */
  src?: string;
  alt: string;
  eyebrow?: string;
  title: string;
  text?: string;
  priority?: boolean;
  tone?: "dark" | "soft";
  height?: "short" | "medium";
};

export function MediaBand({
  src,
  alt,
  eyebrow,
  title,
  text,
  priority = false,
  tone = "dark",
  height = "medium",
}: MediaBandProps) {
  const hasImage = Boolean(src?.trim());
  return (
    <section
      className={`media-band media-band--${height} ${
        tone === "soft" ? "media-band--soft" : ""
      } ${hasImage ? "" : "media-band--plain"}`}
    >
      {hasImage ? (
        <>
          <Image
            src={src!}
            alt={alt}
            fill
            priority={priority}
            className="media-band-image object-cover"
            sizes="100vw"
          />
          <div className="media-band-veil" aria-hidden />
        </>
      ) : null}
      <div className="media-band-copy">
        {eyebrow ? <p className="media-band-eyebrow">{eyebrow}</p> : null}
        <h1 className="media-band-title">{title}</h1>
        {text ? <p className="media-band-text">{text}</p> : null}
      </div>
    </section>
  );
}

type SplitMediaProps = {
  src: string;
  alt: string;
  children: ReactNode;
  imageRight?: boolean;
};

export function SplitMedia({
  src,
  alt,
  children,
  imageRight = true,
}: SplitMediaProps) {
  return (
    <section
      className={`split-media ${imageRight ? "split-media--image-right" : ""}`}
    >
      <div className="split-media-copy">{children}</div>
      <div className="split-media-frame">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}

type ImageStripProps = {
  items: { src: string; alt: string; label: string; href: string }[];
};

export function ImageStrip({ items }: ImageStripProps) {
  return (
    <section className="image-strip" aria-label="Einblicke">
      {items.map((item) => (
        <a key={item.href} href={item.href} className="image-strip-item">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="image-strip-veil" aria-hidden />
          <span className="image-strip-label">{item.label}</span>
        </a>
      ))}
    </section>
  );
}
