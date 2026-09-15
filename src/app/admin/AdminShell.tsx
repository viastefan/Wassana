"use client";

import type { ComponentType, ReactNode } from "react";
import { cmsSite } from "@/cms/config";
import { CmsSetupNotice } from "./CmsSetupNotice";
import { StatusDot } from "./ui";

type NavItem = {
  id: string;
  label: string;
  title?: string;
  hint?: string;
  unread: number;
  Icon: ComponentType<{ className?: string; filled?: boolean }>;
};

export function AdminShell({
  authed,
  nav,
  tab,
  health,
  onNavigate,
  onLogout,
  onRecheck,
  children,
}: {
  authed: boolean;
  nav: NavItem[];
  tab: string;
  health: { blob?: boolean } | null;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  onRecheck: () => void;
  children: ReactNode;
}) {
  const current = nav.find((item) => item.id === tab);
  const title = authed
    ? current?.title || current?.label || cmsSite.name
    : "Anmelden";

  return (
    <>
      <header className={`admin-topbar ${authed ? "" : "is-plain"}`}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
          {authed ? (
            <>
              <p className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-tight">
                {title}
              </p>
              <button
                type="button"
                className={`admin-chip ${
                  health?.blob ? "is-live" : health ? "is-bad" : "is-warn"
                }`}
                onClick={onRecheck}
              >
                <StatusDot tone={health?.blob ? "ok" : health ? "bad" : "warn"} />
                {health?.blob ? "Live" : health ? "Offline" : "Prüfen"}
              </button>
              <button type="button" className="admin-nav-link" onClick={onLogout}>
                Fertig
              </button>
            </>
          ) : (
            <p className="flex-1 text-center text-[17px] font-semibold tracking-tight">
              Anmelden
            </p>
          )}
        </div>
      </header>

      <main className="admin-main mx-auto max-w-3xl px-4 pt-5">
        {authed && health && !health.blob ? (
          <CmsSetupNotice onRecheck={onRecheck} />
        ) : null}
        {children}
      </main>

      {authed ? (
        <nav className="admin-tabbar fixed inset-x-0 bottom-0 z-40" aria-label="App">
          <div className="admin-tabbar-inner">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-tab ${tab === item.id ? "is-active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <span className="admin-tab-glyph" aria-hidden>
                  <item.Icon
                    className="admin-tab-icon"
                    filled={tab === item.id}
                  />
                </span>
                <span className="admin-tab-label">{item.label}</span>
                {item.unread > 0 ? (
                  <span className="admin-tab-badge">
                    {item.unread > 9 ? "9+" : item.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </>
  );
}
