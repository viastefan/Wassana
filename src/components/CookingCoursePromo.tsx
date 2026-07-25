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
};

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

  return (
    <aside
      className="course-promo"
      aria-label={`Nächster Kochkurs am ${dateLabel}`}
    >
      <button
        type="button"
        className="course-promo-close"
        aria-label="Hinweis schließen"
        onClick={() => {
          sessionStorage.setItem("wassana-course-dismissed", "1");
          setHidden(true);
        }}
      >
        ×
      </button>
      <p className="course-promo-eyebrow">Nächster Termin</p>
      <p className="course-promo-title">{course.title || "Kochkurs"}</p>
      <p className="course-promo-date">am {dateLabel}</p>
      {course.teaser ? (
        <p className="course-promo-teaser">{course.teaser}</p>
      ) : null}
      <Link href="/kochkurs" className="btn-primary course-promo-btn">
        Mehr erfahren
      </Link>
    </aside>
  );
}
