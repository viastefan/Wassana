"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StudentLunchOffer } from "@/lib/site-content-shared";
import { STUDENT_LUNCH_POPUP_HREF } from "@/lib/site-content-shared";

/** Auto-show Schüler-Mittag popup after this delay on every full page load. */
export const MITTAG_AUTO_OPEN_MS = 30_000;

type OfferPopupContextValue = {
  open: boolean;
  openOffer: () => void;
  closeOffer: () => void;
  offer: StudentLunchOffer;
};

const OfferPopupContext = createContext<OfferPopupContextValue | null>(null);

export function OfferPopupProvider({
  offer,
  children,
}: {
  offer: StudentLunchOffer;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  /** User closed the popup this page session — don't auto-reopen. */
  const dismissedRef = useRef(false);

  const openOffer = useCallback(() => setOpen(true), []);
  const closeOffer = useCallback(() => {
    dismissedRef.current = true;
    setOpen(false);
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === STUDENT_LUNCH_POPUP_HREF ||
        hash === "#schueler-mittag"
      ) {
        const { pathname, search } = window.location;
        window.history.replaceState(null, "", `${pathname}${search}`);
      }
    }
  }, []);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.toLowerCase();
      if (hash === STUDENT_LUNCH_POPUP_HREF || hash === "#schueler-mittag") {
        setOpen(true);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get("mittag") === "1") {
        setOpen(true);
        params.delete("mittag");
        const next = params.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`,
        );
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (dismissedRef.current) return;
      setOpen(true);
    }, MITTAG_AUTO_OPEN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo(
    () => ({ open, openOffer, closeOffer, offer }),
    [open, openOffer, closeOffer, offer],
  );

  return (
    <OfferPopupContext.Provider value={value}>
      {children}
    </OfferPopupContext.Provider>
  );
}

export function useOfferPopup() {
  const ctx = useContext(OfferPopupContext);
  if (!ctx) {
    throw new Error("useOfferPopup must be used within OfferPopupProvider");
  }
  return ctx;
}

export function useOfferPopupOptional() {
  return useContext(OfferPopupContext);
}
