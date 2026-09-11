"use client";

import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import { cmsProduct, cmsSite } from "@/cms/config";
import { StatusDot } from "./ui";

type NavItem = {
  id: string;
  label: string;
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
  return (
    <div className="cms-frame">
      <aside className="cms-sidebar">
        <div className="cms-brand">
          <p className="cms-brand-product">{cmsProduct.name}</p>
          <p className="cms-brand-vendor">{cmsProduct.vendor}</p>
        </div>
        {authed ? (
          <nav className="cms-nav" aria-label="Module">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`cms-nav-btn ${tab === item.id ? "is-active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <span className="cms-nav-icon" aria-hidden>
                  <item.Icon className="cms-nav-svg" filled={tab === item.id} />
                </span>
                <span className="cms-nav-copy">
                  <span className="cms-nav-label">{item.label}</span>
                  {item.hint ? (
                    <span className="cms-nav-hint">{item.hint}</span>
                  ) : null}
                </span>
                {item.unread > 0 ? (
                  <span className="cms-nav-badge">
                    {item.unread > 9 ? "9+" : item.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        ) : (
          <p className="cms-sidebar-note">Nur Inhaber-Zugang.</p>
        )}
        <div className="cms-sidebar-foot">
          <Image
            src={cmsSite.logoSrc}
            alt=""
            width={36}
            height={36}
            className="cms-sidebar-logo"
          />
          <div>
            <p className="cms-sidebar-site">{cmsSite.name}</p>
            <p className="cms-sidebar-city">{cmsSite.city}</p>
          </div>
        </div>
      </aside>

      <div className="cms-stage">
        <header className="cms-toolbar">
          <div className="cms-toolbar-title">
            <p className="cms-toolbar-kicker">{cmsProduct.name}</p>
            <h1 className="cms-toolbar-heading">
              {authed
                ? nav.find((item) => item.id === tab)?.label || cmsSite.name
                : "Anmelden"}
            </h1>
          </div>
          {authed ? (
            <div className="cms-toolbar-actions">
              <button
                type="button"
                className={`admin-chip ${
                  health?.blob ? "is-live" : health ? "is-bad" : "is-warn"
                }`}
                onClick={onRecheck}
              >
                <StatusDot
                  tone={health?.blob ? "ok" : health ? "bad" : "warn"}
                />
                {health?.blob ? "Live" : health ? "Speicher fehlt" : "Prüfen"}
              </button>
              <a
                className="cms-toolbar-link"
                href={cmsSite.publicUrl}
                target="_blank"
                rel="noreferrer"
              >
                Website
              </a>
              <button type="button" className="cms-toolbar-link" onClick={onLogout}>
                Abmelden
              </button>
            </div>
          ) : null}
        </header>
        <div className="cms-body">{children}</div>
      </div>
    </div>
  );
}
