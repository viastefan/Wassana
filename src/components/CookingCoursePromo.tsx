"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCourseDate } from "@/lib/cooking-course-format";

type Course = {
  active: boolean;
  date: string;
  title: string;
  teaser: string;
  price?: string;
  startTime?: string;
};

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="course-promo-icon">
      <path
        d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="course-promo-icon">
      <path
        d="M7 7l10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CookingCoursePromo() {
  const pathname = usePathname();
  const [course, setCourse] = useState<Course | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setHidden(true);
      return;
    }

    const dismissed = sessionStorage.getItem("wassana-course-dismissed");
    if (dismissed === "1") {
      setHidden(true);
      return;
    }

    let cancelled = false;
    fetch("/api/cooking-course", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Course | null) => {
        if (cancelled || !data?.active || !data.date) {
          setHidden(true);
          return;
        }
        const end = new Date(`${data.date}T23:59:59`);
        if (Number.isNaN(end.getTime()) || end.getTime() < Date.now()) {
          setHidden(true);
          return;
        }
        setCourse(data);
        setHidden(false);
      })
      .catch(() => setHidden(true));

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (hidden || !course || pathname?.startsWith("/admin")) return null;

  const dateLabel = formatCourseDate(course.date);

  function dismiss() {
    sessionStorage.setItem("wassana-course-dismissed", "1");
    setHidden(true);
  }

  return (
    <aside
      className="course-promo"
      aria-label={`Nächster Kochkurs am ${dateLabel}`}
    >
      {/* Compact bar — especially for mobile */}
      <div className="course-promo-compact">
        <Link href="/kochkurs" className="course-promo-compact-main">
          <span className="course-promo-compact-copy">
            <span className="course-promo-compact-label">Kochkurs</span>
            <span className="course-promo-compact-date">{dateLabel}</span>
          </span>
          <span className="course-promo-go" aria-hidden>
            <IconArrow />
          </span>
        </Link>
        <button
          type="button"
          className="course-promo-close"
          aria-label="Hinweis schließen"
          onClick={dismiss}
        >
          <IconClose />
        </button>
      </div>

      {/* Fuller card — desktop */}
      <div className="course-promo-card">
        <button
          type="button"
          className="course-promo-close course-promo-close--card"
          aria-label="Hinweis schließen"
          onClick={dismiss}
        >
          <IconClose />
        </button>
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
