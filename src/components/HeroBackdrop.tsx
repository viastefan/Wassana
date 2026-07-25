"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

/**
 * Full-bleed hero image with a slow Ken Burns drift plus gentle
 * scroll-linked zoom/parallax (camera push as you leave the hero).
 */
export function HeroBackdrop({ src, alt, priority = true }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let frame = 0;

    const sync = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(rect.height, 1);
      // 0 = hero top at viewport top, 1 = hero fully scrolled past
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const value = progress.toFixed(4);
      layer.style.setProperty("--hero-scroll", value);
      root.parentElement?.style.setProperty("--hero-scroll", value);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.parentElement?.style.removeProperty("--hero-scroll");
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-backdrop">
      <div ref={layerRef} className="hero-media-parallax">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="hero-media object-cover"
          sizes="100vw"
        />
      </div>
    </div>
  );
}
