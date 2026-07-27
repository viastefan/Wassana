"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCookingCourse } from "@/components/CookingCourseContext";

/** Floating Kochkurs bar — docks into the footer when you reach the bottom. */
export function CookingCoursePromo() {
  const { course, dateLabel, showFixed, dismiss } = useCookingCourse();

  if (!showFixed || !course) return null;

  return (
    <aside
      className="course-promo"
      aria-label={`Nächster Kochkurs am ${dateLabel}`}
    >
      <button
        type="button"
        className="course-promo-close"
        aria-label="Hinweis schließen"
        onClick={dismiss}
      >
        ×
      </button>

      <Link href="/kochkurs" className="course-promo-compact">
        <span className="course-promo-compact-label">Kochkurs</span>
        <span className="course-promo-compact-date">{dateLabel}</span>
        <span className="course-promo-compact-go" aria-hidden>
          →
        </span>
      </Link>

      <div className="course-promo-card">
        <p className="course-promo-eyebrow">Nächster Termin</p>
        <p className="course-promo-title">{course.title || "Kochkurs"}</p>
        <p className="course-promo-date">
          am {dateLabel}
          {course.startTime?.trim() ? ` · ${course.startTime.trim()} Uhr` : ""}
        </p>
        {course.teaser ? (
          <p className="course-promo-teaser">{course.teaser}</p>
        ) : null}
        {course.price?.trim() ? (
          <p className="course-promo-teaser">{course.price.trim()}</p>
        ) : null}
        <Link href="/kochkurs" className="btn-primary course-promo-btn">
          Mehr erfahren
        </Link>
      </div>
    </aside>
  );
}

/**
 * Lives under the footer copyright. Shows when the floating bar is dismissed
 * or when the user has scrolled to the page bottom (docked).
 */
export function CookingCourseFooterDock() {
  const { course, dateLabel, showFooter, dismissed, setDocked, dismiss } =
    useCookingCourse();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !course || dismissed) {
      setDocked(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setDocked(entry.isIntersecting);
      },
      {
        root: null,
        // Start docking slightly before the absolute bottom so © stays clear
        rootMargin: "0px 0px -12% 0px",
        threshold: 0,
      },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setDocked(false);
    };
  }, [setDocked, course, dismissed]);

  return (
    <div className="course-promo-dock">
      {showFooter && course ? (
        <div
          className="course-promo-footer"
          aria-label={`Nächster Kochkurs am ${dateLabel}`}
        >
          {!dismissed ? (
            <button
              type="button"
              className="course-promo-footer-close"
              aria-label="Hinweis schließen"
              onClick={dismiss}
            >
              ×
            </button>
          ) : null}
          <Link href="/kochkurs" className="course-promo-footer-link">
            <span className="course-promo-compact-label">Kochkurs</span>
            <span className="course-promo-compact-date">{dateLabel}</span>
            <span className="course-promo-compact-go" aria-hidden>
              →
            </span>
          </Link>
        </div>
      ) : null}
      <div
        ref={sentinelRef}
        data-course-promo-sentinel
        className="course-promo-sentinel"
        aria-hidden
      />
    </div>
  );
}
