"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BusinessProfile } from "@/lib/business-profile-shared";
import type { SiteContent } from "@/lib/site-content";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store";
import type { FullMenuData } from "@/lib/menu-store-shared";
import type { ContactInquiry, InquiryStatus } from "@/lib/inquiries-shared";
import {
  inquirySourceLabel,
  inquiryStatusLabel,
} from "@/lib/inquiries-shared";
import {
  buildPublishDiagnostic,
  type DiagnosticReport,
  type PersistSnapshot,
} from "@/lib/admin-support";
import {
  Field,
  PersistChips,
  ScreenHeader,
  Section,
  StatusDot,
  StickySave,
  Toggle,
  type PublishPhase,
} from "./ui";
import { cmsModuleMeta, cmsProduct, cmsSite } from "@/cms/config";
import { AdminFullMenuEditor } from "./AdminFullMenuEditor";
import { AdminShell } from "./AdminShell";
import { AdminWeeklyTable } from "./AdminWeeklyTable";
import { ADMIN_TAB_ICONS } from "./icons";
import { PublishFailDialog } from "./PublishFailDialog";
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Inquiry = ContactInquiry;

type InboxFilter = "active" | "new" | "open" | "done" | "archived";

type Tab = "menu" | "banner" | "inbox" | "settings";

type SiteRuntime = {
  online: boolean;
  checkedAt: string;
  latencyMs: number | null;
};

const BANNER_PRESETS = [
  { label: "Rot", backgroundColor: "#7a0c24", textColor: "#f7f3ea", highlightColor: "#cbb892" },
  { label: "Gold", backgroundColor: "#b59551", textColor: "#1e2129", highlightColor: "#7a0c24" },
  { label: "Dunkel", backgroundColor: "#1e2129", textColor: "#f7f3ea", highlightColor: "#cbb892" },
  { label: "Creme", backgroundColor: "#ebe4d8", textColor: "#1e2129", highlightColor: "#7a0c24" },
] as const;


function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const fieldClass = "admin-field";

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("Wassana");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [savedLoginReady, setSavedLoginReady] = useState(false);
  const [tab, setTab] = useState<Tab>("menu");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishPhase, setPublishPhase] = useState<PublishPhase>("idle");
  const [lastPersist, setLastPersist] = useState<PersistSnapshot | null>(null);
  const [cmsHealth, setCmsHealth] = useState<{
    blob: boolean;
    vercel: boolean;
    githubToken: boolean;
    summary: string;
    checkedAt: string;
  } | null>(null);
  const [failReport, setFailReport] = useState<DiagnosticReport | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unread, setUnread] = useState(0);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("active");
  const [inboxQuery, setInboxQuery] = useState("");
  const [inboxNotes, setInboxNotes] = useState<Record<string, string>>({});
  const [inboxBusyId, setInboxBusyId] = useState<string | null>(null);
  const [inboxDurable, setInboxDurable] = useState(false);
  const [inboxStorage, setInboxStorage] = useState<"blob" | "tmp" | "disk">(
    "disk",
  );
  const [content, setContent] = useState<SiteContent | null>(null);
  const [weekly, setWeekly] = useState<WeeklyMenuData | null>(null);
  const [fullMenu, setFullMenu] = useState<FullMenuData | null>(null);
  const [menuPanel, setMenuPanel] = useState<"weekly" | "full">("weekly");
  const [weeklySearch, setWeeklySearch] = useState("");
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [, setRuntime] = useState<SiteRuntime | null>(null);

  const applyInboxPayload = useCallback(
    (data: {
      inquiries?: Inquiry[];
      unread?: number;
      durable?: boolean;
      storage?: "blob" | "tmp" | "disk";
    }) => {
      const list = data.inquiries || [];
      setInquiries(list);
      setUnread(data.unread || 0);
      setInboxNotes(
        Object.fromEntries(list.map((item) => [item.id, item.notes || ""])),
      );
      if (typeof data.durable === "boolean") setInboxDurable(data.durable);
      if (data.storage) setInboxStorage(data.storage);
    },
    [],
  );

  const loadInbox = useCallback(async () => {
    const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    applyInboxPayload(
      (await res.json()) as {
        inquiries: Inquiry[];
        unread: number;
        durable?: boolean;
        storage?: "blob" | "tmp" | "disk";
      },
    );
  }, [applyInboxPayload]);

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setContent((await res.json()) as SiteContent);
  }, []);

  const loadBusiness = useCallback(async () => {
    const res = await fetch("/api/admin/business", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setBusiness((await res.json()) as BusinessProfile);
  }, []);

  const loadWeekly = useCallback(async () => {
    const res = await fetch("/api/admin/weekly-menu", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setWeekly((await res.json()) as WeeklyMenuData);
  }, []);

  const loadFullMenu = useCallback(async () => {
    const res = await fetch("/api/admin/menu-sections", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    setFullMenu((await res.json()) as FullMenuData);
  }, []);

  const checkRuntime = useCallback(async () => {
    const started = performance.now();
    try {
      const res = await fetch("/robots.txt", {
        cache: "no-store",
      });
      setRuntime({
        online: res.ok,
        checkedAt: new Date().toISOString(),
        latencyMs: Math.round(performance.now() - started),
      });
    } catch {
      setRuntime({
        online: false,
        checkedAt: new Date().toISOString(),
        latencyMs: null,
      });
    }
  }, []);

  const loadCmsHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as {
        env?: DiagnosticReport["env"];
        report?: DiagnosticReport;
      };
      if (!data.env) return;
      setCmsHealth({
        blob: data.env.blob,
        vercel: data.env.vercel,
        githubToken: data.env.githubToken,
        summary:
          data.report?.summary ||
          (data.env.blob
            ? "Live-Speicher bereit — Änderungen können sofort online gehen."
            : "Live-Speicher fehlt — Veröffentlichung auf .de ist blockiert."),
        checkedAt: new Date().toISOString(),
      });
    } catch {
      /* keep previous */
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadInbox(),
      loadContent(),
      loadWeekly(),
      loadFullMenu(),
      loadBusiness(),
      checkRuntime(),
      loadCmsHealth(),
    ]);
  }, [
    checkRuntime,
    loadBusiness,
    loadCmsHealth,
    loadContent,
    loadFullMenu,
    loadInbox,
    loadWeekly,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const started = Date.now();
      try {
        const session = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!cancelled && session.ok) {
          setAuthed(true);
          await loadAll();
        }
      } finally {
        const wait = Math.max(0, 400 - (Date.now() - started));
        if (wait) await sleep(wait);
        if (!cancelled) setChecking(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  useEffect(() => {
    if (checking || authed) return;
    // Silent fill only — no popup. Button uses optional mediation.
    void loadSavedCredentials("silent");
  }, [checking, authed]);

  async function runPublish(
    action: string,
    execute: () => Promise<{
      ok: boolean;
      error?: string;
      warning?: string;
      persist?: PersistSnapshot;
      successMessage?: string;
    }>,
  ) {
    setSaving(true);
    setError("");
    setStatus("");
    setLastPersist(null);
    setPublishPhase("publishing");
    try {
      const result = await execute();

      if (result.persist) setLastPersist(result.persist);

      if (
        !result.ok ||
        result.persist?.durable === false ||
        (cmsHealth?.vercel && result.persist && result.persist.blob !== true)
      ) {
        const report = await finalizeFailReport({
          action,
          error: result.error || result.warning,
          persist: result.persist,
        });
        setFailReport(report);
        setPublishPhase("error");
        setError(report.summary);
        void loadCmsHealth();
        return false;
      }

      setPublishPhase("online");
      setStatus(result.successMessage || result.warning || "Online — live.");
      void loadCmsHealth();
      window.setTimeout(() => {
        setPublishPhase((prev) => (prev === "online" ? "idle" : prev));
      }, 2500);
      return true;
    } catch (error) {
      const report = await finalizeFailReport({
        action,
        error:
          error instanceof Error
            ? error.message
            : "Netzwerkfehler beim Veröffentlichen.",
      });
      setFailReport(report);
      setPublishPhase("error");
      setError(report.summary);
      void loadCmsHealth();
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function finalizeFailReport(input: {
    action: string;
    error?: string;
    persist?: {
      disk?: boolean;
      tmp?: boolean;
      blob?: boolean;
      github?: boolean;
      durable?: boolean;
    };
  }) {
    let env: DiagnosticReport["env"] | undefined;
    try {
      const res = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          env?: DiagnosticReport["env"];
        };
        env = data.env;
      }
    } catch {
      // keep client fallback
    }
    return buildPublishDiagnostic({
      action: input.action,
      ok: false,
      error: input.error,
      persist: input.persist,
      env,
    });
  }

  async function storeLoginCredentials(user: string, pass: string) {
    if (typeof window === "undefined") return;
    try {
      const Cred = (
        window as Window & {
          PasswordCredential?: new (data: {
            id: string;
            password: string;
            name?: string;
          }) => Credential;
        }
      ).PasswordCredential;
      if (!Cred || !navigator.credentials?.store) return;
      const cred = new Cred({
        id: user.trim() || "Wassana",
        password: pass,
        name: "Wassana Verwaltung",
      });
      await navigator.credentials.store(cred);
    } catch {
      // Browser may skip storing — native save prompt still works via autocomplete.
    }
  }

  async function loadSavedCredentials(
    mediation: CredentialMediationRequirement = "optional",
  ) {
    if (typeof window === "undefined" || !navigator.credentials?.get) return;
    try {
      const cred = (await navigator.credentials.get({
        password: true,
        mediation,
      } as CredentialRequestOptions)) as
        | (Credential & { password?: string; id: string })
        | null;
      if (!cred?.password) return;
      setUsername(cred.id || "Wassana");
      setPassword(cred.password);
      setSavedLoginReady(true);
    } catch {
      // User cancelled picker or unsupported.
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setLoginError("");
    setSaving(true);
    const user = username.trim() || "Wassana";
    const pass = password;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setLoginError(data?.error || "Login fehlgeschlagen.");
        return;
      }
      await storeLoginCredentials(user, pass);
      setPassword("");
      setSavedLoginReady(false);
      setAuthed(true);
      setTab("menu");
      await loadAll();
    } catch {
      setLoginError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setTab("menu");
    setInquiries([]);
    setUnread(0);
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    await runPublish("Banner / Website-Texte veröffentlichen", async () => {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json().catch(() => null)) as
        | (SiteContent & {
            error?: string;
            warning?: string;
            persist?: {
              disk?: boolean;
              tmp?: boolean;
              blob?: boolean;
              github?: boolean;
              durable?: boolean;
            };
          })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        return {
          ok: false,
          error: data?.error || "Website-Texte speichern fehlgeschlagen.",
          persist: data?.persist,
        };
      }
      if (data) {
        setContent({
          hero: data.hero,
          meaning: data.meaning,
          hours: data.hours,
          studentLunch: data.studentLunch,
          topBanner: data.topBanner,
          location: data.location,
          closing: data.closing,
          images: data.images,
          updatedAt: data.updatedAt,
        });
      }
      const probe =
        data?.topBanner?.text ||
        data?.studentLunch?.price ||
        data?.studentLunch?.title ||
        content.topBanner.text ||
        content.studentLunch.price ||
        "";
      let live = await confirmLiveHtml("/", probe);
      if (!live) {
        await sleep(600);
        live = await confirmLiveHtml("/", probe);
      }
      if (!live) {
        live = await confirmLiveHtml("/speisekarte", probe);
      }
      if (!live) {
        return {
          ok: false,
          error:
            "Gespeichert, aber die Website zeigt es noch nicht. Nochmal veröffentlichen.",
          persist: data?.persist,
        };
      }
      return {
        ok: true,
        warning: data?.warning,
        persist: data?.persist,
        successMessage: "Live auf der Website",
      };
    });
  }

  async function confirmLiveHtml(path: string, needle: string) {
    const probe = needle.trim().slice(0, 60);
    if (probe.length < 3) return true;
    try {
      await sleep(200);
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) return false;
      const html = await res.text();
      return html.includes(probe);
    } catch {
      return false;
    }
  }

  async function confirmLiveSpeisekarte(needle: string) {
    return confirmLiveHtml("/speisekarte", needle);
  }

  async function saveWeekly(event: FormEvent) {
    event.preventDefault();
    if (!weekly) return;
    await runPublish("Wochen-Favoriten veröffentlichen", async () => {
      const res = await fetch("/api/admin/weekly-menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weekly),
      });
      const data = (await res.json().catch(() => null)) as
        | (WeeklyMenuData & {
            error?: string;
            warning?: string;
            persist?: {
              disk?: boolean;
              tmp?: boolean;
              blob?: boolean;
              github?: boolean;
              durable?: boolean;
            };
          })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        return {
          ok: false,
          error: data?.error || "Wochen-Favoriten speichern fehlgeschlagen.",
          persist: data?.persist,
        };
      }
      if (data) {
        setWeekly({
          note: data.note,
          days: data.days,
          table: data.table || weekly.table,
          updatedAt: data.updatedAt,
        });
      }
      const probe =
        (data?.table || weekly.table || []).find((row) => row.dish.trim())
          ?.dish || "";
      let live = await confirmLiveSpeisekarte(probe);
      if (!live) {
        await sleep(600);
        live = await confirmLiveSpeisekarte(probe);
      }
      if (!live) {
        return {
          ok: false,
          error:
            "Gespeichert, aber die Speisekarte zeigt es noch nicht. Nochmal veröffentlichen.",
          persist: data?.persist,
        };
      }
      return {
        ok: true,
        warning: data?.warning,
        persist: data?.persist,
        successMessage: "Live auf der Speisekarte",
      };
    });
  }

  function moveWeeklyDay(dayIndex: number, dir: -1 | 1) {
    setWeekly((prev) => {
      if (!prev) return prev;
      const nextIndex = dayIndex + dir;
      if (nextIndex < 0 || nextIndex >= prev.days.length) return prev;
      const days = [...prev.days];
      const temp = days[dayIndex];
      days[dayIndex] = days[nextIndex];
      days[nextIndex] = temp;
      return { ...prev, days };
    });
  }

  function moveWeeklyItem(
    dayIndex: number,
    itemIndex: number,
    dir: -1 | 1,
  ) {
    setWeekly((prev) => {
      if (!prev) return prev;
      const day = prev.days[dayIndex];
      if (!day) return prev;
      const nextIndex = itemIndex + dir;
      if (nextIndex < 0 || nextIndex >= day.items.length) return prev;
      const items = [...day.items];
      const temp = items[itemIndex];
      items[itemIndex] = items[nextIndex];
      items[nextIndex] = temp;
      const days = [...prev.days];
      days[dayIndex] = { ...day, items };
      return { ...prev, days };
    });
  }

  function addWeeklyItem(dayIndex: number) {
    setWeekly((prev) => {
      if (!prev) return prev;
      const day = prev.days[dayIndex];
      if (!day || day.items.length >= 40) return prev;
      const days = [...prev.days];
      days[dayIndex] = {
        ...day,
        items: [...day.items, { nr: "–", name: "", price: "", allergens: "" }],
      };
      return { ...prev, days };
    });
  }

  function removeWeeklyItem(dayIndex: number, itemIndex: number) {
    setWeekly((prev) => {
      if (!prev) return prev;
      const day = prev.days[dayIndex];
      if (!day || day.items.length <= 1) return prev;
      const days = [...prev.days];
      days[dayIndex] = {
        ...day,
        items: day.items.filter((_, index) => index !== itemIndex),
      };
      return { ...prev, days };
    });
  }

  async function saveFullMenu(
    event?: FormEvent,
    override?: FullMenuData,
  ) {
    event?.preventDefault();
    const payload = override || fullMenu;
    if (!payload) return false;
    return Boolean(
      await runPublish("Speisekarte veröffentlichen", async () => {
      const res = await fetch("/api/admin/menu-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | (FullMenuData & {
            error?: string;
            warning?: string;
            persist?: {
              disk?: boolean;
              tmp?: boolean;
              blob?: boolean;
              github?: boolean;
              durable?: boolean;
            };
          })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        return {
          ok: false,
          error: data?.error || "Speisekarte speichern fehlgeschlagen.",
          persist: data?.persist,
        };
      }
      if (data?.sections) {
        setFullMenu({
          sections: data.sections,
          updatedAt: data.updatedAt,
        });
      }
      return {
        ok: true,
        warning: data?.warning,
        persist: data?.persist,
        successMessage: "Online — gesamte Speisekarte live",
      };
    }),
    );
  }

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();
    if (!business) return;
    await runPublish("Betriebsdaten veröffentlichen", async () => {
      const res = await fetch("/api/admin/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });
      const data = (await res.json().catch(() => null)) as
        | (BusinessProfile & {
            error?: string;
            warning?: string;
            persist?: {
              disk?: boolean;
              tmp?: boolean;
              blob?: boolean;
              github?: boolean;
              durable?: boolean;
            };
          })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        return {
          ok: false,
          error: data?.error || "Betriebsdaten speichern fehlgeschlagen.",
          persist: data?.persist,
        };
      }
      if (data) {
        setBusiness({
          fullName: data.fullName,
          shortName: data.shortName,
          owner: data.owner,
          street: data.street,
          zip: data.zip,
          city: data.city,
          region: data.region,
          country: data.country,
          phone: data.phone,
          email: data.email,
          instagram: data.instagram,
          instagramHandle: data.instagramHandle,
          facebook: data.facebook,
          taxNote: data.taxNote,
          updatedAt: data.updatedAt,
        });
      }

      // Opening hours live in the site content, not the business profile,
      // but the owner edits both on this one screen.
      if (content) {
        const hoursRes = await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content),
        });
        const hoursData = (await hoursRes.json().catch(() => null)) as
          | (SiteContent & {
              error?: string;
              warning?: string;
              persist?: PersistSnapshot;
            })
          | null;
        if (!hoursRes.ok) {
          if (hoursRes.status === 401) setAuthed(false);
          return {
            ok: false,
            error: hoursData?.error || "Öffnungszeiten speichern fehlgeschlagen.",
            persist: hoursData?.persist,
          };
        }
        if (!(await confirmLiveHtml("/", content.hours.weekdays))) {
          return {
            ok: false,
            error:
              "Gespeichert, aber die Website zeigt die Öffnungszeiten noch nicht. Nochmal veröffentlichen.",
            persist: hoursData?.persist,
          };
        }
      }

      return {
        ok: true,
        warning: data?.warning,
        persist: data?.persist,
        successMessage: "Online — Betriebsdaten und Öffnungszeiten live",
      };
    });
  }

  async function patchInquiry(
    id: string,
    body: {
      read?: boolean;
      status?: InquiryStatus;
      notes?: string;
      archived?: boolean;
    },
  ) {
    setInboxBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error || "Anfrage konnte nicht gespeichert werden.");
        return;
      }
      applyInboxPayload(
        (await res.json()) as {
          inquiries: Inquiry[];
          unread: number;
          durable?: boolean;
          storage?: "blob" | "tmp" | "disk";
        },
      );
    } catch {
      setError("Netzwerkfehler bei der Anfrage.");
    } finally {
      setInboxBusyId(null);
    }
  }

  async function markRead(id: string) {
    await patchInquiry(id, { read: true, status: "open" });
  }

  async function markAllRead() {
    setInboxBusyId("all");
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) return;
      applyInboxPayload(
        (await res.json()) as {
          inquiries: Inquiry[];
          unread: number;
          durable?: boolean;
          storage?: "blob" | "tmp" | "disk";
        },
      );
    } finally {
      setInboxBusyId(null);
    }
  }

  async function deleteInquiryCard(id: string) {
    if (!window.confirm("Diese Anfrage endgültig löschen?")) return;
    setInboxBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        setError("Löschen fehlgeschlagen.");
        return;
      }
      applyInboxPayload(
        (await res.json()) as {
          inquiries: Inquiry[];
          unread: number;
          durable?: boolean;
          storage?: "blob" | "tmp" | "disk";
        },
      );
      setStatus("Anfrage gelöscht.");
    } catch {
      setError("Netzwerkfehler beim Löschen.");
    } finally {
      setInboxBusyId(null);
    }
  }

  const nav = useMemo(
    () =>
      cmsSite.modules.map((mod) => {
        const meta = cmsModuleMeta[mod];
        return {
          id: meta.tab,
          label: meta.label,
          hint: meta.hint,
          unread: meta.tab === "inbox" ? unread : 0,
          Icon: ADMIN_TAB_ICONS[meta.tab],
        };
      }),
    [unread],
  );

  function openModule(id: string) {
    const next = id as Tab;
    setPublishPhase("idle");
    setTab(next);
    setError("");
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (next === "banner") void loadContent();
    if (next === "inbox") void loadInbox();
    if (next === "menu") {
      void loadWeekly();
      void loadFullMenu();
    }
    if (next === "settings") {
      void loadBusiness();
      // Opening hours are edited here but stored in the site content.
      void loadContent();
    }
  }

  const filteredWeeklyDays = useMemo(() => {
    if (!weekly) return [];
    const q = weeklySearch.trim().toLowerCase();
    if (!q) {
      return weekly.days.map((day, index) => ({ day, index }));
    }
    return weekly.days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => {
        const hay = [
          day.day,
          day.dish,
          day.description,
          day.allergens,
          day.info,
          day.kcal,
          day.protein,
          day.fat,
          day.carbs,
          ...day.items.flatMap((item) => [
            item.nr,
            item.name,
            item.price,
            item.allergens,
          ]),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [weekly, weeklySearch]);

  const filteredInquiries = useMemo(() => {
    const q = inboxQuery.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (inboxFilter === "archived") {
        if (!item.archived) return false;
      } else if (inboxFilter === "active") {
        if (item.archived) return false;
      } else if (inboxFilter === "new") {
        if (item.archived || item.status !== "new") return false;
      } else if (inboxFilter === "open") {
        if (item.archived || item.status !== "open") return false;
      } else if (inboxFilter === "done") {
        if (item.archived || item.status !== "done") return false;
      }

      if (!q) return true;
      const hay = [
        item.name,
        item.email,
        item.phone,
        item.subject,
        item.message,
        item.notes,
        item.source,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [inboxFilter, inboxQuery, inquiries]);

  const analytics = useMemo(() => {
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const active = inquiries.filter((item) => !item.archived);
    const week = active.filter(
      (item) => now - new Date(item.createdAt).getTime() <= weekMs,
    );
    const bySource = week.reduce<Record<string, number>>((acc, item) => {
      const key = item.source || "sonstige";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      weekTotal: week.length,
      unread,
      total: active.length,
      archived: inquiries.length - active.length,
      bySource,
    };
  }, [inquiries, unread]);

  return (
    <div className="admin-shell min-h-[100svh] text-[color:var(--admin-ink)]">
      {checking ? (
        <div className="admin-splash" role="status" aria-live="polite">
          <div className="admin-splash-inner">
            <div className="admin-splash-logo-wrap">
              <Image
                src="/images/logo.png"
                alt="Wassana"
                width={132}
                height={132}
                className="admin-splash-logo"
                priority
              />
            </div>
            <p className="admin-splash-title">{cmsProduct.name}</p>
            <p className="admin-splash-sub">{cmsSite.name}</p>
            <div className="admin-splash-bar" aria-hidden>
              <span className="admin-splash-bar-fill" />
            </div>
          </div>
        </div>
      ) : null}

      {failReport ? (
        <PublishFailDialog
          report={failReport}
          onClose={() => {
            setFailReport(null);
            setPublishPhase((prev) => (prev === "error" ? "idle" : prev));
          }}
        />
      ) : null}
      {!checking ? (
      <AdminShell
        authed={authed}
        nav={nav}
        tab={tab}
        health={cmsHealth}
        onNavigate={openModule}
        onLogout={onLogout}
        onRecheck={() => {
          void checkRuntime();
          void loadCmsHealth();
        }}
      >
        {!authed ? (
          <div className="cms-login">
            <form
              onSubmit={onLogin}
              className="admin-login-card space-y-4"
              autoComplete="on"
              name="admin-login"
            >
              <div className="admin-login-logo">
                <Image
                  src="/images/logo.png"
                  alt="Wassana"
                  width={88}
                  height={88}
                  className="h-full w-full object-contain p-1.5"
                  priority
                />
              </div>
              <p className="admin-kicker">{cmsProduct.vendor}</p>
              <h1 className="admin-screen-title">{cmsProduct.name}</h1>
              <p className="admin-screen-desc">
                {cmsProduct.tagline} Mandant: {cmsSite.name}. Nur der Inhaber.
              </p>
              <label className="block">
                <span className="text-sm text-[color:var(--admin-muted)]">
                  Benutzer
                </span>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldClass}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-[color:var(--admin-muted)]">
                  Passwort
                </span>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSavedLoginReady(false);
                  }}
                  className={fieldClass}
                  required
                />
              </label>
              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? "Prüfen …" : "Anmelden"}
              </button>
              {savedLoginReady ? (
                <p className="text-center text-sm text-[color:var(--admin-muted)]">
                  Passwort ist geladen — Anmelden tippen.
                </p>
              ) : null}
              {loginError ? (
                <p className="text-sm text-[color:var(--admin-burgundy)]">{loginError}</p>
              ) : null}
            </form>
          </div>
        ) : (
          <>
            <div key={tab} className="admin-page-enter">
            {tab === "inbox" ? (
              <section className="space-y-3">
                <ScreenHeader
                  title="Anfragen"
                  description="Nur der Inhaber sieht das. Status setzen oder archivieren."
                  action={
                    unread > 0 ? (
                      <button
                        type="button"
                        className="btn-gold !px-3 !py-2 text-sm"
                        disabled={inboxBusyId === "all"}
                        onClick={() => void markAllRead()}
                      >
                        Alle gelesen
                      </button>
                    ) : null
                  }
                />

                <div
                  className={`admin-inbox-storage ${
                    inboxDurable ? "is-durable" : "is-temp"
                  }`}
                >
                  {inboxDurable ? (
                    <p>
                      Dauerhaft gespeichert (verschlüsselter Blob) · max. 500
                      Einträge · keine PII in GitHub.
                    </p>
                  ) : (
                    <p>
                      {inboxStorage === "tmp"
                        ? "Anfragen liegen nur vorübergehend auf dem Server — solange der Speicher nicht verbunden ist, können sie verloren gehen."
                        : "Anfragen liegen lokal auf diesem Rechner."}
                    </p>
                  )}
                </div>

                <div className="admin-status-grid">
                  <div className="admin-status-item">
                    <p className="admin-status-label">Aktiv</p>
                    <p className="admin-status-value">{analytics.total}</p>
                    <p className="admin-status-meta">nicht archiviert</p>
                  </div>
                  <div className="admin-status-item">
                    <p className="admin-status-label">Neu</p>
                    <p className="admin-status-value">{unread}</p>
                    <p className="admin-status-meta">ungelesen</p>
                  </div>
                  <div className="admin-status-item">
                    <p className="admin-status-label">Archiv</p>
                    <p className="admin-status-value">{analytics.archived}</p>
                    <p className="admin-status-meta">abgelegt</p>
                  </div>
                </div>

                <div className="admin-inbox-toolbar">
                  <label className="admin-inbox-search">
                    <span className="sr-only">Suchen</span>
                    <input
                      value={inboxQuery}
                      onChange={(e) => setInboxQuery(e.target.value)}
                      className={fieldClass}
                      placeholder="Name, Mail, Telefon, Text …"
                    />
                  </label>
                  <div className="admin-inbox-filters" role="tablist" aria-label="Filter">
                    {(
                      [
                        ["active", "Aktiv"],
                        ["new", "Neu"],
                        ["open", "Offen"],
                        ["done", "Erledigt"],
                        ["archived", "Archiv"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={inboxFilter === id}
                        className={`admin-filter-chip ${
                          inboxFilter === id ? "is-active" : ""
                        }`}
                        onClick={() => setInboxFilter(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredInquiries.length === 0 ? (
                  <div className="admin-empty">
                    {inquiries.length === 0
                      ? "Noch keine Anfragen eingegangen."
                      : "Keine Treffer für diesen Filter."}
                  </div>
                ) : (
                  <ul className="admin-inbox-list">
                    {filteredInquiries.map((item) => {
                      const busy = inboxBusyId === item.id;
                      const notesDraft = inboxNotes[item.id] ?? item.notes;
                      return (
                        <li
                          key={item.id}
                          className={`admin-inbox-card ${
                            item.status === "new" ? "is-unread" : ""
                          } ${item.archived ? "is-archived" : ""}`}
                        >
                          <div className="admin-inbox-top">
                            <div className="min-w-0">
                              <p className="admin-kicker">
                                {item.subject}
                                {" · "}
                                {inquirySourceLabel(item.source)}
                              </p>
                              <p className="mt-1 font-display text-lg text-[color:var(--admin-burgundy)]">
                                {item.name}
                              </p>
                              <p className="mt-1 text-sm text-[color:var(--admin-muted)]">
                                {formatWhen(item.createdAt)}
                                {item.email ? ` · ${item.email}` : ""}
                                {item.phone ? ` · ${item.phone}` : ""}
                              </p>
                            </div>
                            <span
                              className={`admin-chip ${
                                item.status === "new"
                                  ? "is-live"
                                  : item.status === "done"
                                    ? "is-done"
                                    : ""
                              }`}
                            >
                              {item.archived
                                ? "Archiv"
                                : inquiryStatusLabel(item.status)}
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-[color:var(--admin-ink)]">
                            {item.message}
                          </p>

                          <div className="mt-3 grid gap-1 text-xs text-[color:var(--admin-muted)] sm:grid-cols-2">
                            <p>
                              Mail Inhaber:{" "}
                              {item.mailOwnerSent ? "gesendet" : "—"}
                            </p>
                            <p>
                              Mail Gast:{" "}
                              {item.mailGuestSent ? "gesendet" : "—"}
                            </p>
                          </div>

                          <Field label="Private Notiz">
                            <textarea
                              value={notesDraft}
                              onChange={(e) =>
                                setInboxNotes((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className={fieldClass}
                              rows={2}
                              placeholder="Nur für dich im Admin …"
                            />
                          </Field>

                          <div className="admin-inbox-actions">
                            <a
                              href={`mailto:${item.email}`}
                              className="btn-primary"
                            >
                              Mail
                            </a>
                            {item.phone ? (
                              <a href={`tel:${item.phone}`} className="btn-gold">
                                Anrufen
                              </a>
                            ) : null}
                            {item.status === "new" ? (
                              <button
                                type="button"
                                className="btn-gold"
                                disabled={busy}
                                onClick={() => void markRead(item.id)}
                              >
                                Öffnen
                              </button>
                            ) : null}
                            {item.status !== "done" && !item.archived ? (
                              <button
                                type="button"
                                className="btn-gold"
                                disabled={busy}
                                onClick={() =>
                                  void patchInquiry(item.id, {
                                    status: "done",
                                    read: true,
                                  })
                                }
                              >
                                Erledigt
                              </button>
                            ) : null}
                            {item.status === "done" && !item.archived ? (
                              <button
                                type="button"
                                className="btn-gold"
                                disabled={busy}
                                onClick={() =>
                                  void patchInquiry(item.id, {
                                    status: "open",
                                  })
                                }
                              >
                                Wieder öffnen
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="btn-gold"
                              disabled={busy || notesDraft === (item.notes || "")}
                              onClick={async () => {
                                await patchInquiry(item.id, {
                                  notes: notesDraft,
                                });
                                setStatus("Notiz gespeichert.");
                              }}
                            >
                              Notiz speichern
                            </button>
                            {!item.archived ? (
                              <button
                                type="button"
                                className="btn-gold"
                                disabled={busy}
                                onClick={() =>
                                  void patchInquiry(item.id, {
                                    archived: true,
                                  })
                                }
                              >
                                Archiv
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-gold"
                                disabled={busy}
                                onClick={() =>
                                  void patchInquiry(item.id, {
                                    archived: false,
                                  })
                                }
                              >
                                Zurückholen
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-gold admin-danger-btn"
                              disabled={busy}
                              onClick={() => void deleteInquiryCard(item.id)}
                            >
                              Löschen
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : null}

            {tab === "banner" && content ? (
              <form onSubmit={saveContent} className="admin-form space-y-3">
                <ScreenHeader
                  title="Angebote"
                  description="Banner und Schüler-Mittag. Veröffentlichen schreibt beides live auf die Website."
                />
                <Section title="Top-Banner">
                  <Toggle
                    checked={content.topBanner.active}
                    onChange={(active) =>
                      setContent({
                        ...content,
                        topBanner: { ...content.topBanner, active },
                      })
                    }
                    label="Banner anzeigen"
                    hint="Sofort auf der Website sichtbar"
                  />
                  <Field label="Text">
                    <input
                      value={content.topBanner.text}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            text: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="Schüler & Azubis: mittags Gericht inkl. Getränk"
                    />
                  </Field>
                  <Field label="Hervorhebung (z. B. Preis)">
                    <input
                      value={content.topBanner.highlight}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            highlight: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="ab 8,90 €"
                    />
                  </Field>
                  <Field
                    label="Link-Ziel"
                    hint="#mittag öffnet das Angebot-Popup · sonst normale URL"
                  >
                    <input
                      value={content.topBanner.linkHref}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            linkHref: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="#mittag"
                    />
                  </Field>
                  <Field label="Link-Text">
                    <input
                      value={content.topBanner.linkLabel}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            linkLabel: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="Mehr"
                    />
                  </Field>
                  <Field
                    label="Text nach dem Link"
                    hint="Steht hinter „Mehr“, z. B. Ortshinweis"
                  >
                    <input
                      value={content.topBanner.suffix || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          topBanner: {
                            ...content.topBanner,
                            suffix: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder=". Wo? In Landshut am Regierungsplatz"
                    />
                  </Field>
                </Section>

                <details className="admin-advanced">
                  <summary>Farben</summary>
                <Section title="Farben">
                  <div className="admin-color-row">
                    {BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="admin-swatch"
                        style={{
                          backgroundColor: preset.backgroundColor,
                          color: preset.textColor,
                        }}
                        onClick={() =>
                          setContent({
                            ...content,
                            topBanner: {
                              ...content.topBanner,
                              backgroundColor: preset.backgroundColor,
                              textColor: preset.textColor,
                              highlightColor: preset.highlightColor,
                            },
                          })
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {(
                    [
                      ["backgroundColor", "Hintergrund"],
                      ["textColor", "Textfarbe"],
                      ["highlightColor", "Hervorhebung"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="admin-color-pick">
                      <span className="text-sm text-[color:var(--admin-muted)]">
                        {label}
                      </span>
                      <input
                        type="color"
                        value={content.topBanner[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            topBanner: {
                              ...content.topBanner,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                </Section>
                </details>

                <div className="admin-preview" aria-hidden>
                  <p className="admin-preview-label">Vorschau</p>
                  <div
                    className="px-4 py-3 text-center text-sm"
                    style={{
                      backgroundColor: content.topBanner.backgroundColor,
                      color: content.topBanner.textColor,
                    }}
                  >
                    {content.topBanner.text || "Banner-Text"}{" "}
                    {content.topBanner.highlight ? (
                      <span
                        className="font-semibold"
                        style={{ color: content.topBanner.highlightColor }}
                      >
                        {content.topBanner.highlight}
                      </span>
                    ) : null}
                    {content.topBanner.linkLabel ? (
                      <span
                        className="ml-2 underline"
                        style={{ color: content.topBanner.highlightColor }}
                      >
                        {content.topBanner.linkLabel}
                      </span>
                    ) : null}
                    {content.topBanner.suffix ? (
                      <span className="ml-1 opacity-95">
                        {content.topBanner.suffix}
                      </span>
                    ) : null}
                  </div>
                </div>

                <Section title="Schüler-Mittag">
                  {(
                    [
                      ["title", "Titel"],
                      ["price", "Preis"],
                      ["text", "Kurztext"],
                      ["note", "Hinweis"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input
                        value={content.studentLunch[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            studentLunch: {
                              ...content.studentLunch,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    </Field>
                  ))}
                </Section>

                <details className="admin-advanced">
                  <summary>Mittag-Popup (Mehr-Button)</summary>
                  {(
                    [
                      ["popupTitle", "Popup-Titel"],
                      ["popupLead", "Kurztext oben"],
                      ["popupPrice", "Preis im Popup"],
                      ["popupNote", "Hinweis im Popup"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input
                        value={content.studentLunch[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            studentLunch: {
                              ...content.studentLunch,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    </Field>
                  ))}
                </details>

                <StickySave
                  saving={saving}
                  phase={publishPhase}
                  label="Angebot live schalten"
                />
              </form>
            ) : null}

            {tab === "menu" ? (
              <div className="space-y-3">
                {weekly ? (
              <form onSubmit={saveWeekly} className="admin-form space-y-3">
                <ScreenHeader
                  title="Speisekarte"
                  description="Gericht und Preis tippen, unten live schalten. Steht sofort auf der Website."
                />
                <AdminWeeklyTable weekly={weekly} setWeekly={setWeekly} />
                <details className="admin-advanced">
                  <summary>Alle Gerichte und Tageskarten</summary>
                  <div className="admin-menu-switch" role="tablist" aria-label="Menübereich">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={menuPanel === "weekly"}
                    className={`admin-menu-switch-btn ${menuPanel === "weekly" ? "is-active" : ""}`}
                    onClick={() => {
                      setMenuPanel("weekly");
                      void loadWeekly();
                    }}
                  >
                    Tageskarten
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={menuPanel === "full"}
                    className={`admin-menu-switch-btn ${menuPanel === "full" ? "is-active" : ""}`}
                    onClick={() => {
                      setMenuPanel("full");
                      void loadFullMenu();
                    }}
                  >
                    Alle Gerichte
                  </button>
                </div>
                <Section title="Allgemein">
                  <Field label="Gericht suchen">
                    <input
                      type="search"
                      value={weeklySearch}
                      onChange={(e) => setWeeklySearch(e.target.value)}
                      className="admin-menu-search"
                      placeholder="z. B. Curry, Montag, Huhn, A,B …"
                      autoComplete="off"
                    />
                  </Field>
                  <Field label="Hinweis unter dem Titel">
                    <input
                      value={weekly.note}
                      onChange={(e) =>
                        setWeekly({ ...weekly, note: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <p className="text-sm text-[color:var(--admin-muted)]">
                    Kennzeichnung z. B. <strong>A,B,C</strong> oder{" "}
                    <strong>E</strong> — siehe Legende auf der Speisekarte.
                    Infos und Nährwerte erscheinen per <strong>i</strong> am
                    Gericht. Mit ↑ ↓ verschiebst du Tage und Varianten.
                  </p>
                </Section>

                {filteredWeeklyDays.length === 0 ? (
                  <p className="admin-empty">
                    Kein Gericht gefunden für „{weeklySearch.trim()}“.
                  </p>
                ) : null}

                {filteredWeeklyDays.map(({ day, index: dayIndex }) => (
                  <Section
                    key={`${day.day}-${dayIndex}`}
                    title={day.day}
                    action={
                      <>
                        <button
                          type="button"
                          className="admin-sort-btn"
                          aria-label={`${day.day} nach oben`}
                          disabled={dayIndex === 0}
                          onClick={() => moveWeeklyDay(dayIndex, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-sort-btn"
                          aria-label={`${day.day} nach unten`}
                          disabled={dayIndex === weekly.days.length - 1}
                          onClick={() => moveWeeklyDay(dayIndex, 1)}
                        >
                          ↓
                        </button>
                      </>
                    }
                  >
                    <Field label="Wochentag / Überschrift">
                      <input
                        value={day.day}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = { ...day, day: e.target.value };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                        placeholder="Montag"
                      />
                    </Field>
                    <Field label="Gericht">
                      <input
                        value={day.dish}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = { ...day, dish: e.target.value };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Beschreibung">
                      <input
                        value={day.description || ""}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = {
                            ...day,
                            description: e.target.value,
                          };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label="Kennzeichnung Gericht"
                      hint="z. B. A,B,C — gilt für das Tagesgericht"
                    >
                      <input
                        value={day.allergens || ""}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = {
                            ...day,
                            allergens: e.target.value,
                          };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                        placeholder="A,B,C"
                      />
                    </Field>
                    <Field
                      label="Zusatzinfo / Allergie-Hinweise"
                      hint="Erscheint im Info-Popup auf der Website"
                    >
                      <textarea
                        value={day.info || ""}
                        onChange={(e) => {
                          const days = [...weekly.days];
                          days[dayIndex] = { ...day, info: e.target.value };
                          setWeekly({ ...weekly, days });
                        }}
                        className={fieldClass}
                        rows={3}
                        placeholder="z. B. enthält Fischsauce, auf Wunsch ohne Erdnüsse …"
                      />
                    </Field>
                    <div className="admin-nutrition-grid">
                      <Field label="kcal" hint="optional">
                        <input
                          value={day.kcal || ""}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            days[dayIndex] = { ...day, kcal: e.target.value };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                          placeholder="z. B. 520"
                        />
                      </Field>
                      <Field label="Eiweiß" hint="optional">
                        <input
                          value={day.protein || ""}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            days[dayIndex] = {
                              ...day,
                              protein: e.target.value,
                            };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                          placeholder="z. B. 28 g"
                        />
                      </Field>
                      <Field label="Fett" hint="optional">
                        <input
                          value={day.fat || ""}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            days[dayIndex] = { ...day, fat: e.target.value };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                          placeholder="z. B. 18 g"
                        />
                      </Field>
                      <Field label="Kohlenhydrate" hint="optional">
                        <input
                          value={day.carbs || ""}
                          onChange={(e) => {
                            const days = [...weekly.days];
                            days[dayIndex] = { ...day, carbs: e.target.value };
                            setWeekly({ ...weekly, days });
                          }}
                          className={fieldClass}
                          placeholder="z. B. 55 g"
                        />
                      </Field>
                    </div>
                    <div className="admin-day-grid">
                      <div className="admin-day-grid-head">
                        <p className="admin-day-grid-label">
                          Preisvarianten · Position {dayIndex + 1}/
                          {weekly.days.length}
                        </p>
                        <button
                          type="button"
                          className="btn-gold !px-3 !py-1.5 text-sm"
                          disabled={day.items.length >= 40}
                          onClick={() => addWeeklyItem(dayIndex)}
                        >
                          + Variante
                        </button>
                      </div>
                      {day.items.map((item, itemIndex) => (
                        <div
                          key={`${item.nr}-${itemIndex}`}
                          className="admin-day-row admin-day-row--allergen"
                        >
                          <div className="admin-day-row-sort">
                            <button
                              type="button"
                              className="admin-sort-btn"
                              aria-label={`Variante ${itemIndex + 1} nach oben`}
                              disabled={itemIndex === 0}
                              onClick={() =>
                                moveWeeklyItem(dayIndex, itemIndex, -1)
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="admin-sort-btn"
                              aria-label={`Variante ${itemIndex + 1} nach unten`}
                              disabled={itemIndex === day.items.length - 1}
                              onClick={() =>
                                moveWeeklyItem(dayIndex, itemIndex, 1)
                              }
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="admin-sort-btn"
                              aria-label={`Variante ${itemIndex + 1} entfernen`}
                              disabled={day.items.length <= 1}
                              onClick={() =>
                                removeWeeklyItem(dayIndex, itemIndex)
                              }
                              title="Entfernen"
                            >
                              ×
                            </button>
                          </div>
                          <div className="admin-day-row-fields">
                            <input
                              aria-label={`${day.day} Nr`}
                              value={item.nr}
                              onChange={(e) => {
                                const days = [...weekly.days];
                                const items = [...day.items];
                                items[itemIndex] = {
                                  ...item,
                                  nr: e.target.value,
                                };
                                days[dayIndex] = { ...day, items };
                                setWeekly({ ...weekly, days });
                              }}
                              className={fieldClass}
                              placeholder="Nr"
                            />
                            <input
                              aria-label={`${day.day} Name`}
                              value={item.name}
                              onChange={(e) => {
                                const days = [...weekly.days];
                                const items = [...day.items];
                                items[itemIndex] = {
                                  ...item,
                                  name: e.target.value,
                                };
                                days[dayIndex] = { ...day, items };
                                setWeekly({ ...weekly, days });
                              }}
                              className={fieldClass}
                              placeholder="Name"
                            />
                            <input
                              aria-label={`${day.day} Preis`}
                              value={item.price}
                              onChange={(e) => {
                                const days = [...weekly.days];
                                const items = [...day.items];
                                items[itemIndex] = {
                                  ...item,
                                  price: e.target.value,
                                };
                                days[dayIndex] = { ...day, items };
                                setWeekly({ ...weekly, days });
                              }}
                              className={fieldClass}
                              placeholder="Preis"
                            />
                            <input
                              aria-label={`${day.day} Kennzeichnung`}
                              value={item.allergens || ""}
                              onChange={(e) => {
                                const days = [...weekly.days];
                                const items = [...day.items];
                                items[itemIndex] = {
                                  ...item,
                                  allergens: e.target.value,
                                };
                                days[dayIndex] = { ...day, items };
                                setWeekly({ ...weekly, days });
                              }}
                              className={fieldClass}
                              placeholder="A,B"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                ))}
                </details>
                <StickySave
                  saving={saving}
                  phase={publishPhase}
                  label="Speisekarte live schalten"
                />
              </form>
                ) : null}

                {menuPanel === "full" && fullMenu ? (
                  <AdminFullMenuEditor
                    menu={fullMenu}
                    setMenu={setFullMenu}
                    saving={saving}
                    publishPhase={publishPhase}
                    onSave={saveFullMenu}
                    onPublishMenu={(next) => saveFullMenu(undefined, next)}
                  />
                ) : null}

                {menuPanel === "weekly" && !weekly ? (
                  <p className="admin-empty">Wochen-Favoriten werden geladen …</p>
                ) : null}
                {menuPanel === "full" && !fullMenu ? (
                  <p className="admin-empty">Speisekarte wird geladen …</p>
                ) : null}
              </div>
            ) : null}


            {tab === "settings" && business ? (
              <form onSubmit={saveBusiness} className="admin-form space-y-3">
                <ScreenHeader
                  title="Betrieb"
                  description="Öffnungszeiten, Stammdaten und Abmelden."
                />
                <Section title="Live-Speicher">
                  <div className="admin-status-grid">
                    <div className="admin-status-item">
                      <p className="admin-status-label">
                        <StatusDot
                          tone={
                            cmsHealth?.blob
                              ? "ok"
                              : cmsHealth
                                ? "bad"
                                : "neutral"
                          }
                        />
                        Live
                      </p>
                      <p className="admin-status-value">
                        {cmsHealth?.blob
                          ? "Bereit"
                          : cmsHealth
                            ? "Fehlt"
                            : "—"}
                      </p>
                      <p className="admin-status-meta">
                        Speisekarte und Angebote gehen direkt auf die Website.
                      </p>
                    </div>
                  </div>
                  {lastPersist ? <PersistChips persist={lastPersist} /> : null}
                  <Link href="/" className="btn-gold mt-3 w-full" target="_blank">
                    Website öffnen
                  </Link>
                  <Link
                    href="/speisekarte"
                    className="btn-gold mt-2 w-full"
                    target="_blank"
                  >
                    Speisekarte öffnen
                  </Link>
                  <button
                    type="button"
                    className="btn-primary mt-2 w-full"
                    onClick={onLogout}
                  >
                    Abmelden
                  </button>
                </Section>
              {content ? (
                <Section title="Öffnungszeiten">
                  <Field label="Kurz (Kopf und Fuß der Website)">
                    <input
                      value={content.hours.weekdays}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekdays: e.target.value },
                        })
                      }
                      className={fieldClass}
                      placeholder="Mo–Fr 11:00–18:00"
                    />
                  </Field>
                  <Field label="Ausgeschrieben (Kontakt, Impressum)">
                    <input
                      value={content.hours.weekdaysLong}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: {
                            ...content.hours,
                            weekdaysLong: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      placeholder="Montag bis Freitag von 11:00–18:00 Uhr"
                    />
                  </Field>
                  <Field label="Ruhetage und Feiertage">
                    <input
                      value={content.hours.weekend}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekend: e.target.value },
                        })
                      }
                      className={fieldClass}
                      placeholder="Sa, So & Feiertage geschlossen"
                    />
                  </Field>
                </Section>
              ) : null}
                <details className="admin-advanced">
                  <summary>Betrieb (Adresse, Telefon)</summary>
                <Section title="Betrieb">
                  <Field label="Betriebsname">
                    <input
                      value={business.fullName}
                      onChange={(e) =>
                        setBusiness({ ...business, fullName: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Kurzname (SEO)">
                    <input
                      value={business.shortName}
                      onChange={(e) =>
                        setBusiness({ ...business, shortName: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Inhaber">
                    <input
                      value={business.owner}
                      onChange={(e) =>
                        setBusiness({ ...business, owner: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>
                <Section title="Adresse">
                  <Field label="Straße">
                    <input
                      value={business.street}
                      onChange={(e) =>
                        setBusiness({ ...business, street: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <div className="grid grid-cols-[7rem_1fr] gap-2">
                    <Field label="PLZ">
                      <input
                        value={business.zip}
                        onChange={(e) =>
                          setBusiness({ ...business, zip: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Ort">
                      <input
                        value={business.city}
                        onChange={(e) =>
                          setBusiness({ ...business, city: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                  <Field label="Region">
                    <input
                      value={business.region}
                      onChange={(e) =>
                        setBusiness({ ...business, region: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>
                <Section title="Kontakt">
                  <Field label="Telefon">
                    <input
                      value={business.phone}
                      onChange={(e) =>
                        setBusiness({ ...business, phone: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="E-Mail">
                    <input
                      type="email"
                      value={business.email}
                      onChange={(e) =>
                        setBusiness({ ...business, email: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>
                <Section title="Social">
                  <Field label="Instagram URL">
                    <input
                      value={business.instagram}
                      onChange={(e) =>
                        setBusiness({ ...business, instagram: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Instagram Handle">
                    <input
                      value={business.instagramHandle}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          instagramHandle: e.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Facebook URL">
                    <input
                      value={business.facebook}
                      onChange={(e) =>
                        setBusiness({ ...business, facebook: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>
                <Section title="Rechtliches">
                  <Field
                    label="Hinweis Umsatzsteuer / Impressum"
                    hint="Erscheint im Impressum"
                  >
                    <textarea
                      value={business.taxNote}
                      onChange={(e) =>
                        setBusiness({ ...business, taxNote: e.target.value })
                      }
                      className={fieldClass}
                      rows={3}
                    />
                  </Field>
                </Section>

                <Section title="E-Mail bei Admin-Änderungen">
                  <p className="text-sm text-[color:var(--admin-muted)]">
                    Bei jeder Veröffentlichung (Speisekarte, Angebote, Betrieb)
                    geht automatisch eine Info-Mail an{" "}
                    <strong>stefandirnberger@viawen.com</strong> — sofern der
                    E-Mail-Versand auf Vercel eingerichtet ist.
                  </p>
                </Section>

                </details>
                <StickySave
                  saving={saving}
                  phase={publishPhase}
                  label="Betrieb veröffentlichen"
                />
              </form>
            ) : null}

            </div>
            {error ? (
              <p className="admin-toast is-error">{error}</p>
            ) : null}
            {status ? (
              <div className="admin-toast is-ok">
                <p>{status}</p>
                <a
                  className="admin-toast-link"
                  href={tab === "banner" ? "/" : "/speisekarte"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tab === "banner" ? "Website ansehen" : "Speisekarte ansehen"}
                </a>
                <PersistChips persist={lastPersist} />
              </div>
            ) : null}
          </>
        )}
      </AdminShell>
      ) : null}
    </div>
  );
}
