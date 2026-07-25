"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { formatCourseDate } from "@/lib/cooking-course-format";

export type CookingCourse = {
  active: boolean;
  date: string;
  title: string;
  teaser: string;
  price?: string;
  startTime?: string;
};

type CookingCourseContextValue = {
  course: CookingCourse | null;
  dateLabel: string;
  dismissed: boolean;
  /** Floating fixed promo is currently showing */
  showFixed: boolean;
  /** Static row under footer copyright */
  showFooter: boolean;
  docked: boolean;
  setDocked: (docked: boolean) => void;
  dismiss: () => void;
};

const CookingCourseContext = createContext<CookingCourseContextValue | null>(
  null,
);

const DISMISS_KEY = "wassana-course-dismissed";

export function CookingCourseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [course, setCourse] = useState<CookingCourse | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [docked, setDocked] = useState(false);
  const isAdmin = Boolean(pathname?.startsWith("/admin"));

  useEffect(() => {
    if (isAdmin) {
      setCourse(null);
      setDismissed(true);
      return;
    }

    const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);

    let cancelled = false;
    fetch("/api/cooking-course", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CookingCourse | null) => {
        if (cancelled || !data?.active || !data.date) {
          setCourse(null);
          return;
        }
        const end = new Date(`${data.date}T23:59:59`);
        if (Number.isNaN(end.getTime()) || end.getTime() < Date.now()) {
          setCourse(null);
          return;
        }
        setCourse(data);
      })
      .catch(() => setCourse(null));

    return () => {
      cancelled = true;
    };
  }, [pathname, isAdmin]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setDocked(false);
  }, []);

  const dateLabel = course ? formatCourseDate(course.date) : "";
  const active = Boolean(course) && !isAdmin;

  // Fixed while open and not docked into the footer
  const showFixed = active && !dismissed && !docked;
  // Under © when dismissed, or when scrolled to the footer end
  const showFooter = active && (dismissed || docked);

  useEffect(() => {
    document.documentElement.classList.toggle("has-course-promo", showFixed);
    return () => {
      document.documentElement.classList.remove("has-course-promo");
    };
  }, [showFixed]);

  const value = useMemo(
    () => ({
      course,
      dateLabel,
      dismissed,
      showFixed,
      showFooter,
      docked,
      setDocked,
      dismiss,
    }),
    [course, dateLabel, dismissed, showFixed, showFooter, docked, dismiss],
  );

  return (
    <CookingCourseContext.Provider value={value}>
      {children}
    </CookingCourseContext.Provider>
  );
}

export function useCookingCourse() {
  const ctx = useContext(CookingCourseContext);
  if (!ctx) {
    throw new Error("useCookingCourse must be used within CookingCourseProvider");
  }
  return ctx;
}
