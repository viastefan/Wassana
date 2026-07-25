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
import { formatCourseDate } from "@/lib/cooking-course-format";
import type { BusinessProfile } from "@/lib/business-profile-shared";
import type { SiteContent } from "@/lib/site-content";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store";
import {
  COURSE_IMAGE_OPTIONS,
  createBlankCourse,
  type CookingCourseArchiveEntry,
  type CookingCourseData,
} from "@/lib/cooking-course-shared";
import type { ContactInquiry, InquiryStatus } from "@/lib/inquiries-shared";
import {
  inquirySourceLabel,
  inquiryStatusLabel,
} from "@/lib/inquiries-shared";
import {
  Field,
  ScreenHeader,
  Section,
  StickySave,
  Toggle,
} from "./ui";
import { ADMIN_TAB_ICONS } from "./icons";
import {
  enableAdminPushNotifications,
  getNotificationPermission,
  sendAdminPush,
  showLocalAdminNotification,
} from "./push-client";

type Course = CookingCourseData;

type Inquiry = ContactInquiry;

type InboxFilter = "active" | "new" | "open" | "done" | "archived";

type Tab = "home" | "course" | "inbox" | "content" | "banner" | "menu" | "settings";

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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

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

const NAV_META: Record<Tab, { label: string; title: string }> = {
  home: { label: "Home", title: "Übersicht" },
  course: { label: "Kurs", title: "Kochkurs" },
  inbox: { label: "Post", title: "Anfragen-DB" },
  banner: { label: "Banner", title: "Top-Banner" },
  content: { label: "Texte", title: "Website-Texte" },
  menu: { label: "Menü", title: "Wochenkarte" },
  settings: { label: "Betrieb", title: "Einstellungen" },
};

export function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);

  const [course, setCourse] = useState<Course>(() => createBlankCourse());
  const [courseArchive, setCourseArchive] = useState<
    CookingCourseArchiveEntry[]
  >([]);
  const [completeFazit, setCompleteFazit] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [archiveDrafts, setArchiveDrafts] = useState<
    Record<string, { fazit: string; notes: string }>
  >({});
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
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [runtime, setRuntime] = useState<SiteRuntime | null>(null);
  const [liveBusy, setLiveBusy] = useState<"banner" | "course" | null>(null);
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | "unsupported" | "unknown"
  >("unknown");
  const [pushDeviceCount, setPushDeviceCount] = useState(0);
  const [newsTitle, setNewsTitle] = useState("Wassana News");
  const [newsBody, setNewsBody] = useState("");

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

  const applyCourseStore = useCallback(
    (store: { current: Course; archive?: CookingCourseArchiveEntry[] }) => {
      setCourse(store.current);
      const archive = store.archive || [];
      setCourseArchive(archive);
      setArchiveDrafts(
        Object.fromEntries(
          archive.map((entry) => [
            entry.id,
            { fazit: entry.fazit, notes: entry.notes },
          ]),
        ),
      );
    },
    [],
  );

  const loadCourseStore = useCallback(async () => {
    const res = await fetch("/api/admin/cooking-course", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    applyCourseStore(
      (await res.json()) as {
        current: Course;
        archive?: CookingCourseArchiveEntry[];
      },
    );
  }, [applyCourseStore]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadCourseStore(),
      loadInbox(),
      loadContent(),
      loadWeekly(),
      loadBusiness(),
      checkRuntime(),
    ]);
  }, [
    checkRuntime,
    loadBusiness,
    loadContent,
    loadCourseStore,
    loadInbox,
    loadWeekly,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.register("/admin-sw.js").catch(() => null);
        }

        const session = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!cancelled && session.ok) {
          setAuthed(true);
          await loadAll();
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  useEffect(() => {
    const DISMISS_KEY = "wassana-admin-install-dismissed";

    try {
      setInstallDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setInstallDismissed(false);
    }

    function readInstalled() {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        // iOS Safari
        ("standalone" in navigator &&
          Boolean(
            (navigator as Navigator & { standalone?: boolean }).standalone,
          ))
      );
    }

    setInstalled(readInstalled());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      try {
        window.localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
      setInstallDismissed(true);
    };
    const onDisplayChange = () => {
      if (readInstalled()) onInstalled();
    };

    const standaloneMq = window.matchMedia("(display-mode: standalone)");
    standaloneMq.addEventListener?.("change", onDisplayChange);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      standaloneMq.removeEventListener?.("change", onDisplayChange);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    void getNotificationPermission().then(setNotifPermission);
  }, [authed]);

  async function refreshPushCount() {
    try {
      const res = await fetch("/api/admin/push/subscribe", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      setPushDeviceCount(data.count || 0);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (authed) void refreshPushCount();
  }, [authed]);

  async function enableNotifications() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const result = await enableAdminPushNotifications();
      setNotifPermission(result.permission || (await getNotificationPermission()));
      if (!result.ok) {
        setError(result.error || "Benachrichtigungen nicht aktiv.");
        return;
      }
      await refreshPushCount();
      setStatus(result.error || "Benachrichtigungen sind aktiv.");
    } finally {
      setSaving(false);
    }
  }

  async function sendNewsNotification(event?: FormEvent) {
    event?.preventDefault();
    if (!newsTitle.trim() || !newsBody.trim()) {
      setError("Bitte Titel und Text für die News ausfüllen.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await showLocalAdminNotification({
        title: newsTitle.trim(),
        body: newsBody.trim(),
        url: "/admin",
        tag: "news",
      });
      const result = await sendAdminPush({
        title: newsTitle.trim(),
        body: newsBody.trim(),
        url: "/admin",
        tag: "news",
      });
      if (!result.ok) {
        setStatus(
          result.error ||
            "Lokal angezeigt. Push an andere Geräte ggf. noch nicht konfiguriert.",
        );
        return;
      }
      setStatus(`News gesendet (${result.sent} Gerät${result.sent === 1 ? "" : "e"}).`);
      setNewsBody("");
    } finally {
      setSaving(false);
    }
  }

  function dismissInstallBanner() {
    try {
      window.localStorage.setItem("wassana-admin-install-dismissed", "1");
    } catch {
      /* ignore */
    }
    setInstallDismissed(true);
  }

  async function onInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") {
      setInstalled(true);
      dismissInstallBanner();
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setLoginError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setLoginError(data?.error || "Login fehlgeschlagen.");
        return;
      }
      setPassword("");
      setAuthed(true);
      setTab("home");
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
    setTab("home");
    setInquiries([]);
    setUnread(0);
  }

  async function saveCourse(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/cooking-course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });
      const data = (await res.json().catch(() => null)) as
        | (Course & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Speichern fehlgeschlagen.");
        return;
      }
      if (data) {
        setCourse({
          active: data.active,
          date: data.date,
          title: data.title,
          teaser: data.teaser,
          image: data.image,
          pageTitle: data.pageTitle,
          pageText: data.pageText,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(
        data?.warning ||
          `Kochkurs gespeichert — Widget: ${course.title} am ${formatCourseDate(course.date)}`,
      );
      if (data?.active) {
        const title = "Neuer Kochkurs";
        const body = `${data.title || "Thai Kochkurs"} am ${formatCourseDate(data.date)}`;
        void showLocalAdminNotification({
          title,
          body,
          url: "/admin",
          tag: "course",
        });
        void sendAdminPush({
          title,
          body,
          url: "/admin",
          tag: "course",
        });
      }
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function runCourseAction(
    body: Record<string, string>,
    okMessage: string,
  ) {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/cooking-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | ({
            current?: Course;
            archive?: CookingCourseArchiveEntry[];
            error?: string;
            warning?: string;
          } & Record<string, unknown>)
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Aktion fehlgeschlagen.");
        return;
      }
      if (data?.current) {
        applyCourseStore({
          current: data.current,
          archive: data.archive,
        });
      }
      if (body.action === "complete") {
        setCompleteFazit("");
        setCompleteNotes("");
      }
      setStatus(data?.warning || okMessage);
    } catch {
      setError("Netzwerkfehler bei der Kurs-Aktion.");
    } finally {
      setSaving(false);
    }
  }

  async function completeCourse() {
    if (
      !window.confirm(
        `Kurs „${course.title || "Thai Kochkurs"}“ als erledigt abhaken und archivieren?`,
      )
    ) {
      return;
    }
    await runCourseAction(
      {
        action: "complete",
        fazit: completeFazit,
        notes: completeNotes,
      },
      "Kurs abgehakt und archiviert. Neuen Termin kannst du jetzt anlegen.",
    );
  }

  async function deleteCurrentCourse() {
    if (
      !window.confirm(
        "Aktuellen Kurs wirklich löschen? Er erscheint nicht im Archiv.",
      )
    ) {
      return;
    }
    await runCourseAction(
      { action: "delete-current" },
      "Aktueller Kurs gelöscht.",
    );
  }

  async function deleteArchiveEntry(id: string, title: string) {
    if (!window.confirm(`Archiv-Eintrag „${title}“ wirklich löschen?`)) {
      return;
    }
    await runCourseAction(
      { action: "delete-archive", id },
      "Archiv-Eintrag gelöscht.",
    );
  }

  async function saveArchiveEntry(id: string) {
    const draft = archiveDrafts[id];
    await runCourseAction(
      {
        action: "update-archive",
        id,
        fazit: draft?.fazit || "",
        notes: draft?.notes || "",
      },
      "Fazit / Notizen gespeichert.",
    );
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json().catch(() => null)) as
        | (SiteContent & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Website-Texte speichern fehlgeschlagen.");
        return;
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
          updatedAt: data.updatedAt,
        });
      }
      setStatus(data?.warning || "Website-Texte aktualisiert.");
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function saveWeekly(event: FormEvent) {
    event.preventDefault();
    if (!weekly) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/weekly-menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weekly),
      });
      const data = (await res.json().catch(() => null)) as
        | (WeeklyMenuData & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Wochenkarte speichern fehlgeschlagen.");
        return;
      }
      if (data) {
        setWeekly({
          note: data.note,
          days: data.days,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(data?.warning || "Wochenkarte aktualisiert.");
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function setBannerLive(active: boolean) {
    if (!content || liveBusy) return;
    const previous = content;
    const next = {
      ...content,
      topBanner: { ...content.topBanner, active },
    };
    setContent(next);
    setLiveBusy("banner");
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = (await res.json().catch(() => null)) as
        | (SiteContent & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setContent(previous);
        setError(data?.error || "Live-Schaltung Banner fehlgeschlagen.");
        return;
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
          updatedAt: data.updatedAt,
        });
      }
      setStatus(
        data?.warning ||
          (active ? "Banner ist jetzt live." : "Banner ist ausgeschaltet."),
      );
    } catch {
      setContent(previous);
      setError("Netzwerkfehler bei der Live-Schaltung.");
    } finally {
      setLiveBusy(null);
    }
  }

  async function setCourseLive(active: boolean) {
    if (liveBusy) return;
    if (!course.date) {
      setError("Bitte zuerst unter Kurs ein Datum setzen.");
      setTab("course");
      return;
    }
    const previous = course;
    const next = { ...course, active };
    setCourse(next);
    setLiveBusy("course");
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/cooking-course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = (await res.json().catch(() => null)) as
        | (Course & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setCourse(previous);
        setError(data?.error || "Live-Schaltung Kochkurs fehlgeschlagen.");
        return;
      }
      if (data) {
        setCourse({
          active: data.active,
          date: data.date,
          title: data.title,
          teaser: data.teaser,
          image: data.image,
          pageTitle: data.pageTitle,
          pageText: data.pageText,
          updatedAt: data.updatedAt,
        });
      }
      setStatus(
        data?.warning ||
          (active
            ? "Kochkurs-Widget ist live."
            : "Kochkurs-Widget ist ausgeschaltet."),
      );
    } catch {
      setCourse(previous);
      setError("Netzwerkfehler bei der Live-Schaltung.");
    } finally {
      setLiveBusy(null);
    }
  }

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();
    if (!business) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/admin/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });
      const data = (await res.json().catch(() => null)) as
        | (BusinessProfile & { error?: string; warning?: string })
        | null;
      if (!res.ok) {
        if (res.status === 401) setAuthed(false);
        setError(data?.error || "Betriebsdaten speichern fehlgeschlagen.");
        return;
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
      setStatus(data?.warning || "Betriebsdaten aktualisiert.");
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
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
      (["home", "course", "inbox", "banner", "content", "menu", "settings"] as const).map(
        (id) => ({
          id,
          label:
            id === "inbox" && unread > 0
              ? `${NAV_META[id].label} ${unread}`
              : NAV_META[id].label,
          Icon: ADMIN_TAB_ICONS[id],
        }),
      ),
    [unread],
  );

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

  const showInstallBanner = !installed && !installDismissed;

  const installBlock = showInstallBanner ? (
    <section className="admin-install-hero mb-5">
      <button
        type="button"
        className="admin-install-close"
        aria-label="Installationshinweis schließen"
        onClick={dismissInstallBanner}
      >
        ×
      </button>
      <p className="admin-kicker !text-[color:var(--admin-gold-soft)]">Web-App</p>
      <h2 className="font-display mt-2 text-2xl text-white md:text-[1.7rem]">
        App jetzt herunterladen
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
        Speichere die Verwaltung auf dem Homescreen. Danach startet sie ohne
        Browser-Leiste — ideal fürs Handy im Laden.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {installEvent ? (
          <button
            type="button"
            className="btn-primary !bg-white !text-[color:var(--admin-burgundy)] hover:!bg-[color:var(--admin-bg)]"
            onClick={() => void onInstall()}
          >
            App installieren
          </button>
        ) : (
          <span className="admin-chip !bg-white/12 !text-white">
            Bereit zum Speichern
          </span>
        )}
      </div>
      {!installEvent ? (
        <p className="mt-3 text-xs leading-relaxed text-white/70">
          iPhone: Teilen → „Zum Home-Bildschirm“. Android: Menü → „App
          installieren“ / „Zum Startbildschirm“.
        </p>
      ) : null}
    </section>
  ) : null;

  return (
    <div className="admin-shell min-h-[100svh] text-[color:var(--admin-ink)]">
      <header className="admin-topbar">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <div className="admin-brand-mark">
            <Image
              src="/images/logo.png"
              alt="Wassana"
              width={40}
              height={40}
              className="h-9 w-9 rounded-full object-contain bg-[color:var(--admin-raised)] p-0.5"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-[color:var(--admin-burgundy)]">
              Wassana Verwaltung
            </p>
            <p className="truncate text-xs text-[color:var(--admin-muted)]">
              Laden-App · Banner, Menü, Anfragen
            </p>
          </div>
          {authed ? (
            <button
              type="button"
              className="btn-gold !px-3 !py-2 text-sm"
              onClick={onLogout}
            >
              Raus
            </button>
          ) : (
            <span className="admin-chip is-live">Live</span>
          )}
        </div>
      </header>

      <main className="admin-main mx-auto max-w-3xl px-4 pt-5">
        {checking ? (
          <div className="admin-login-card">
            <p className="admin-kicker">Laden</p>
            <p className="mt-2 font-display text-2xl text-[color:var(--admin-burgundy)]">
              Verwaltung startet …
            </p>
          </div>
        ) : !authed ? (
          <div className="space-y-5">
            {installBlock}
            <form onSubmit={onLogin} className="admin-login-card space-y-4">
              <p className="admin-kicker">Zugang</p>
              <h1 className="font-display text-3xl text-[color:var(--admin-burgundy)]">
                Anmelden
              </h1>
              <p className="text-[color:var(--admin-muted)] leading-relaxed">
                Danach steuerst du Kochkurs, Anfragen, Banner, Texte und die
                Wochenkarte — direkt als App.
              </p>
              <label className="block">
                <span className="text-sm text-[color:var(--admin-muted)]">
                  Passwort
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                  required
                />
              </label>
              {loginError ? (
                <p className="text-sm text-[color:var(--admin-burgundy)]">{loginError}</p>
              ) : null}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Prüfen …" : "In die Verwaltung"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {installBlock}

            {tab === "home" ? (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="admin-kicker">Dashboard</p>
                    <h1 className="font-display mt-1 text-3xl text-[color:var(--admin-burgundy)]">
                      Übersicht
                    </h1>
                  </div>
                  <button
                    type="button"
                    className="admin-chip is-live"
                    onClick={() => void checkRuntime()}
                  >
                    {runtime?.online ? "Online" : runtime ? "Offline" : "Check"}
                  </button>
                </div>


                {notifPermission === "default" || notifPermission === "unknown" ? (
                  <Section title="Mitteilungen">
                    <p className="text-sm text-[color:var(--admin-muted)]">
                      App-Benachrichtigungen für Kochkurse und News aktivieren —
                      erscheint wie bei einer echten Handy-App.
                    </p>
                    <button
                      type="button"
                      className="btn-primary mt-3 w-full"
                      onClick={() => void enableNotifications()}
                      disabled={saving}
                    >
                      Benachrichtigungen erlauben
                    </button>
                  </Section>
                ) : null}
                <Section title="Live-Schaltung">
                  <Toggle
                    checked={Boolean(content?.topBanner.active)}
                    onChange={(active) => void setBannerLive(active)}
                    label="Top-Banner live"
                    hint={
                      liveBusy === "banner"
                        ? "Schaltet gerade …"
                        : "Sofort auf der Website sichtbar"
                    }
                  />
                  <Toggle
                    checked={course.active}
                    onChange={(active) => void setCourseLive(active)}
                    label="Kochkurs-Widget live"
                    hint={
                      liveBusy === "course"
                        ? "Schaltet gerade …"
                        : course.date
                          ? `Termin: ${formatCourseDate(course.date)}`
                          : "Kein Datum gesetzt"
                    }
                  />
                </Section>

                <Section title="Runtime-Status">
                  <div className="admin-status-grid">
                    <div className="admin-status-item">
                      <p className="admin-status-label">Website</p>
                      <p className="admin-status-value">
                        {runtime
                          ? runtime.online
                            ? "Erreichbar"
                            : "Nicht erreichbar"
                          : "—"}
                      </p>
                      <p className="admin-status-meta">
                        {runtime?.latencyMs != null
                          ? `${runtime.latencyMs} ms`
                          : "noch nicht geprüft"}
                      </p>
                    </div>
                    <div className="admin-status-item">
                      <p className="admin-status-label">Banner</p>
                      <p className="admin-status-value">
                        {content?.topBanner.active ? "Live" : "Aus"}
                      </p>
                      <p className="admin-status-meta">
                        {content?.topBanner.text
                          ? content.topBanner.text.slice(0, 42)
                          : "kein Text"}
                      </p>
                    </div>
                    <div className="admin-status-item">
                      <p className="admin-status-label">Kochkurs</p>
                      <p className="admin-status-value">
                        {course.active ? "Live" : "Aus"}
                      </p>
                      <p className="admin-status-meta">
                        {course.updatedAt
                          ? `Stand ${formatWhen(course.updatedAt)}`
                          : "noch nicht gespeichert"}
                      </p>
                    </div>
                    <div className="admin-status-item">
                      <p className="admin-status-label">Inhalte</p>
                      <p className="admin-status-value">
                        {content?.updatedAt ? "Aktuell" : "—"}
                      </p>
                      <p className="admin-status-meta">
                        {content?.updatedAt
                          ? formatWhen(content.updatedAt)
                          : "keine Daten"}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section title="Analytics">
                  <div className="admin-status-grid">
                    <div className="admin-status-item">
                      <p className="admin-status-label">7 Tage</p>
                      <p className="admin-status-value">
                        {analytics.weekTotal}
                      </p>
                      <p className="admin-status-meta">Anfragen</p>
                    </div>
                    <div className="admin-status-item">
                      <p className="admin-status-label">Ungelesen</p>
                      <p className="admin-status-value">{analytics.unread}</p>
                      <p className="admin-status-meta">
                        von {analytics.total} gesamt
                      </p>
                    </div>
                  </div>
                  {Object.keys(analytics.bySource).length ? (
                    <ul className="admin-source-list">
                      {Object.entries(analytics.bySource)
                        .sort((a, b) => b[1] - a[1])
                        .map(([source, count]) => (
                          <li key={source}>
                            <span>{source}</span>
                            <strong>{count}</strong>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[color:var(--admin-muted)]">
                      In den letzten 7 Tagen keine Anfragen.
                    </p>
                  )}
                </Section>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["course", "Kochkurs", course.title || "Termin", course.date ? formatCourseDate(course.date) : "Noch kein Datum"],
                      ["inbox", "Anfragen-DB", unread > 0 ? `${unread} neu` : "Datenbank", `${analytics.total} aktiv · ${analytics.archived} Archiv`],
                      ["banner", "Top-Banner", content?.topBanner?.active ? "Sichtbar" : "Aus", "Mittagsangebot über dem Menü"],
                      ["content", "Website", "Texte ändern", "Hero, Zeiten, Schüler-Mittag …"],
                      ["menu", "Speisekarte", "Wochenkarte pflegen", "Mo–Fr Gerichte & Preise"],
                    ] as const
                  ).map(([id, kicker, title, meta]) => {
                    const Icon = ADMIN_TAB_ICONS[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`admin-card ${id === "menu" ? "sm:col-span-2" : ""}`}
                        onClick={() => setTab(id)}
                      >
                        <span className="admin-card-icon">
                          <Icon className="admin-icon" />
                        </span>
                        <p className="mt-3 text-sm text-[color:var(--admin-gold-deep)]">
                          {kicker}
                        </p>
                        <p className="mt-1 font-display text-xl text-[color:var(--admin-burgundy)]">
                          {title}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--admin-muted)]">
                          {meta}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-gold inline-flex"
                    onClick={() => setTab("settings")}
                  >
                    Einstellungen
                  </button>
                  <button
                    type="button"
                    className="btn-primary inline-flex"
                    onClick={() => {
                      setCourse(createBlankCourse());
                      setTab("course");
                      setError("");
                      setStatus(
                        "Neuer Kochkurs vorbereitet — Datum prüfen und speichern.",
                      );
                    }}
                  >
                    + Neuer Kochkurs
                  </button>
                  <Link href="/" className="btn-gold inline-flex" target="_blank">
                    Website öffnen
                  </Link>
                  <button
                    type="button"
                    className="btn-gold inline-flex"
                    onClick={() => void loadAll()}
                  >
                    Status aktualisieren
                  </button>
                </div>
              </section>
            ) : null}

            {tab === "course" ? (
              <form onSubmit={saveCourse} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Kochkurs"
                  title="Nächster Termin"
                  description="Anlegen, live schalten, nach dem Kurs abhaken mit Fazit — oder falsch Eingetragenes löschen."
                  action={
                    <button
                      type="button"
                      className="btn-primary !px-3 !py-2 text-sm"
                      onClick={() => {
                        setCourse(createBlankCourse());
                        setError("");
                        setStatus(
                          "Neuer Kochkurs vorbereitet — Datum prüfen und speichern.",
                        );
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      + Neuer Kurs
                    </button>
                  }
                />

                <Section title="Aktueller Stand">
                  <div className="admin-status-grid">
                    <div className="admin-status-item">
                      <p className="admin-status-label">Status</p>
                      <p className="admin-status-value">
                        {course.active ? "Live" : "Entwurf"}
                      </p>
                      <p className="admin-status-meta">
                        {course.date
                          ? formatCourseDate(course.date)
                          : "kein Datum"}
                      </p>
                    </div>
                    <div className="admin-status-item">
                      <p className="admin-status-label">Titel</p>
                      <p className="admin-status-value">
                        {(course.title || "Thai Kochkurs").slice(0, 18)}
                      </p>
                      <p className="admin-status-meta">
                        {course.teaser || "kein Kurztext"}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section title="Steuerung">
                  <Toggle
                    checked={course.active}
                    onChange={(active) =>
                      setCourse((c) => ({ ...c, active }))
                    }
                    label="Auf der Website anzeigen"
                    hint="Live = Widget + Termin-Hinweis auf /kochkurs"
                  />
                  <Field label="Datum">
                    <input
                      type="date"
                      value={course.date}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, date: e.target.value }))
                      }
                      className={fieldClass}
                      required
                    />
                  </Field>
                  <Field label="Titel (Widget & Seite)">
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, title: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Thai Kochkurs / Pad Thai Abend"
                    />
                  </Field>
                  <Field label="Kurztext">
                    <input
                      type="text"
                      value={course.teaser}
                      onChange={(e) =>
                        setCourse((c) => ({ ...c, teaser: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Noch Plätze frei"
                    />
                  </Field>
                </Section>

                <Section title="Bild für Unterseite">
                  <p className="mb-2 text-sm text-[color:var(--admin-muted)]">
                    Schmückt den Hero auf /kochkurs.
                  </p>
                  <div className="admin-image-grid">
                    {COURSE_IMAGE_OPTIONS.map((option) => {
                      const selected = course.image === option.src;
                      return (
                        <button
                          key={option.src}
                          type="button"
                          className={`admin-image-option ${selected ? "is-selected" : ""}`}
                          onClick={() =>
                            setCourse((c) => ({ ...c, image: option.src }))
                          }
                          aria-pressed={selected}
                        >
                          <Image
                            src={option.src}
                            alt={option.label}
                            width={160}
                            height={100}
                            className="admin-image-option-img"
                          />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Texte auf /kochkurs">
                  <Field label="Hero-Titel">
                    <input
                      type="text"
                      value={course.pageTitle}
                      onChange={(e) =>
                        setCourse((c) => ({
                          ...c,
                          pageTitle: e.target.value,
                        }))
                      }
                      className={fieldClass}
                      placeholder="Thai-Küche näher kennenlernen"
                    />
                  </Field>
                  <Field label="Hero-Text">
                    <textarea
                      value={course.pageText}
                      onChange={(e) =>
                        setCourse((c) => ({
                          ...c,
                          pageText: e.target.value,
                        }))
                      }
                      className={fieldClass}
                      rows={3}
                    />
                  </Field>
                </Section>

                <StickySave saving={saving} label="Kochkurs speichern" />

                <Section title="Erledigt abhaken">
                  <p className="text-sm text-[color:var(--admin-muted)]">
                    Nach dem Kurs: abhaken, kurz Fazit schreiben (was gewünscht
                    war) und private Notizen nur für dich. Der Termin kommt von
                    der Website runter und landet im Archiv.
                  </p>
                  <Field
                    label="Fazit — was war erwünscht / wie lief’s?"
                    hint="Für dich zum Nachlesen (nicht öffentlich)."
                  >
                    <textarea
                      value={completeFazit}
                      onChange={(e) => setCompleteFazit(e.target.value)}
                      className={fieldClass}
                      rows={3}
                      placeholder="z. B. Pad Thai gewünscht, 8 Gäste, viel Interesse an Tom Yam …"
                    />
                  </Field>
                  <Field
                    label="Notizen nur für dich"
                    hint="Einkauf, Tipps, was du nächstes Mal ändern willst."
                  >
                    <textarea
                      value={completeNotes}
                      onChange={(e) => setCompleteNotes(e.target.value)}
                      className={fieldClass}
                      rows={3}
                      placeholder="Interne Notizen …"
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={saving || !course.date}
                      onClick={() => void completeCourse()}
                    >
                      Kurs abhaken & archivieren
                    </button>
                    <button
                      type="button"
                      className="btn-gold"
                      disabled={saving}
                      onClick={() => void deleteCurrentCourse()}
                    >
                      Aktuellen Kurs löschen
                    </button>
                  </div>
                </Section>

                <Section title="Archiv / vergangene Kurse">
                  {courseArchive.length === 0 ? (
                    <p className="admin-empty">
                      Noch keine abgehakten Kurse. Nach dem Abhaken erscheinen
                      sie hier mit Fazit und Notizen.
                    </p>
                  ) : (
                    <div className="admin-inbox-list">
                      {courseArchive.map((entry) => {
                        const draft = archiveDrafts[entry.id] || {
                          fazit: entry.fazit,
                          notes: entry.notes,
                        };
                        return (
                          <article
                            key={entry.id}
                            className="admin-inbox-card space-y-3"
                          >
                            <div className="admin-inbox-top">
                              <div>
                                <p className="admin-kicker">
                                  {formatCourseDate(entry.date)}
                                </p>
                                <p className="mt-1 font-display text-xl text-[color:var(--admin-burgundy)]">
                                  {entry.title}
                                </p>
                                {entry.teaser ? (
                                  <p className="mt-1 text-sm text-[color:var(--admin-muted)]">
                                    {entry.teaser}
                                  </p>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                className="btn-gold !px-3 !py-2 text-sm"
                                disabled={saving}
                                onClick={() =>
                                  void deleteArchiveEntry(entry.id, entry.title)
                                }
                              >
                                Löschen
                              </button>
                            </div>
                            <Field label="Fazit">
                              <textarea
                                value={draft.fazit}
                                onChange={(e) =>
                                  setArchiveDrafts((prev) => ({
                                    ...prev,
                                    [entry.id]: {
                                      ...draft,
                                      fazit: e.target.value,
                                    },
                                  }))
                                }
                                className={fieldClass}
                                rows={2}
                              />
                            </Field>
                            <Field label="Notizen für dich">
                              <textarea
                                value={draft.notes}
                                onChange={(e) =>
                                  setArchiveDrafts((prev) => ({
                                    ...prev,
                                    [entry.id]: {
                                      ...draft,
                                      notes: e.target.value,
                                    },
                                  }))
                                }
                                className={fieldClass}
                                rows={2}
                              />
                            </Field>
                            <button
                              type="button"
                              className="btn-primary !px-3 !py-2 text-sm"
                              disabled={saving}
                              onClick={() => void saveArchiveEntry(entry.id)}
                            >
                              Fazit speichern
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </Section>
              </form>
            ) : null}

            {tab === "inbox" ? (
              <section className="space-y-3">
                <ScreenHeader
                  kicker="Datenbank"
                  title="Kontaktanfragen"
                  description="Eingehende Anfragen aus Kontakt, Catering und Kochkurs — speichern, bearbeiten, archivieren."
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
                      Speicherung aktiv
                      {inboxStorage === "tmp"
                        ? " (Server-/tmp — auf Vercel mit Blob dauerhaft machen)"
                        : " (lokal)"}
                      . Für Live-Dauerhaftigkeit:{" "}
                      <code>BLOB_READ_WRITE_TOKEN</code> in Vercel setzen.
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
                  kicker="Top-Leiste"
                  title="Banner"
                  description="Über dem Menü auf allen Seiten — Text, Link und Farben."
                />
                <Section title="Inhalt">
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
                      placeholder="Schüler & Azubis in Landshut: mittags Gericht inkl. Getränk"
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
                </Section>

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
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-gold w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      topBanner: {
                        ...content.topBanner,
                        active: true,
                        text: `${content.studentLunch.eyebrow}: ${content.studentLunch.title}`,
                        highlight: content.studentLunch.price,
                        linkHref: "#mittag",
                        linkLabel: "Mehr",
                      },
                    })
                  }
                >
                  Aus Schüler-Mittag übernehmen
                </button>
                <StickySave saving={saving} label="Banner speichern" />
              </form>
            ) : null}

            {tab === "content" && content ? (
              <form onSubmit={saveContent} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Website"
                  title="Texte"
                  description="Alles, was auf der öffentlichen Seite steht — tippen und speichern."
                />
                <Section title="Hero Startseite">
                  <Field label="Begrüßung über Wassana">
                    <input
                      value={content.hero.eyebrow}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, eyebrow: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Text unter Wassana">
                    <textarea
                      rows={2}
                      value={content.hero.lede}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, lede: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>

                <Section title="Bedeutung">
                  <Field label="Bedeutung „Wassana“">
                    <textarea
                      rows={3}
                      value={content.meaning}
                      onChange={(e) =>
                        setContent({ ...content, meaning: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>

                <Section title="Öffnungszeiten">
                  <Field label="Kurz (z. B. Mo–Fr …)">
                    <input
                      value={content.hours.weekdays}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekdays: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Lang (Wochentage)">
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
                    />
                  </Field>
                  <Field label="Wochenende / Feiertage">
                    <input
                      value={content.hours.weekend}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hours: { ...content.hours, weekend: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>

                <Section title="Schüler-Mittag">
                  {(
                    [
                      ["eyebrow", "Überschrift klein"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                      ["price", "Preis"],
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

                <Section title="Mittag-Popup">
                  <p className="mb-2 text-sm text-[color:var(--admin-muted)]">
                    Inhalt für Banner „Mehr“ und den Button auf der Startseite.
                    Auf dem Handy als Sheet von unten.
                  </p>
                  {(
                    [
                      ["popupTitle", "Popup-Titel"],
                      ["popupLead", "Kurztext oben"],
                      ["popupPrice", "Preis im Popup"],
                      ["popupNote", "Hinweis im Popup"],
                      ["popupCtaLabel", "Button-Text"],
                      ["popupCtaHref", "Button-Link"],
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
                  <Field
                    label="Ausführlicher Text"
                    hint="Längere Erklärung im Popup"
                  >
                    <textarea
                      value={content.studentLunch.popupBody}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          studentLunch: {
                            ...content.studentLunch,
                            popupBody: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      rows={4}
                    />
                  </Field>
                  <Field
                    label="Punkte (eine Zeile = ein Punkt)"
                    hint="z. B. Softgetränk inklusive"
                  >
                    <textarea
                      value={content.studentLunch.popupBullets}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          studentLunch: {
                            ...content.studentLunch,
                            popupBullets: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                      rows={5}
                    />
                  </Field>
                </Section>

                <Section title="Standort">
                  {(
                    [
                      ["eyebrow", "Kleine Zeile"],
                      ["title", "Titel"],
                      ["text", "Beschreibung"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input
                        value={content.location[key]}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            location: {
                              ...content.location,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    </Field>
                  ))}
                </Section>

                <Section title="Abschluss">
                  <Field label="Titel">
                    <input
                      value={content.closing.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          closing: {
                            ...content.closing,
                            title: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field
                    label="Text"
                    hint="Leer = Adresse + Zeiten automatisch"
                  >
                    <textarea
                      rows={2}
                      value={content.closing.text}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          closing: {
                            ...content.closing,
                            text: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </Section>
                <StickySave saving={saving} label="Texte speichern" />
              </form>
            ) : null}

            {tab === "menu" && weekly ? (
              <form onSubmit={saveWeekly} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Speisekarte"
                  title="Wochenkarte"
                  description="Pro Tag Gericht, Preise und Kennzeichnung (z. B. A,B,C) — wie auf der Speisekarte."
                />
                <Section title="Allgemein">
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
                    <strong>E</strong> — siehe Legende auf der Speisekarte
                    (Weizen, Soja, Austernsauce, Fischsauce …).
                  </p>
                </Section>

                {weekly.days.map((day, dayIndex) => (
                  <Section key={`${day.day}-${dayIndex}`} title={day.day}>
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
                    <div className="admin-day-grid">
                      {day.items.map((item, itemIndex) => (
                        <div
                          key={`${item.nr}-${itemIndex}`}
                          className="admin-day-row admin-day-row--allergen"
                        >
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
                      ))}
                    </div>
                  </Section>
                ))}
                <StickySave saving={saving} label="Wochenkarte speichern" />
              </form>
            ) : null}


            {tab === "settings" && business ? (
              <form onSubmit={saveBusiness} className="admin-form space-y-3">
                <ScreenHeader
                  kicker="Einstellungen"
                  title="Betrieb & Inhaber"
                  description="Alle Stammdaten für Website, Impressum, Kontakt und Anfragen."
                />
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

                <Section title="App-Benachrichtigungen">
                  <p className="text-sm text-[color:var(--admin-muted)]">
                    Wie bei einer echten App: Nachrichten zu Kochkursen und News
                    auf dem Homescreen. Am besten in der installierten App
                    erlauben.
                  </p>
                  <div className="admin-status-grid mt-2">
                    <div className="admin-status-item">
                      <p className="admin-status-label">Status</p>
                      <p className="admin-status-value">
                        {notifPermission === "granted"
                          ? "An"
                          : notifPermission === "denied"
                            ? "Blockiert"
                            : notifPermission === "unsupported"
                              ? "— "
                              : "Aus"}
                      </p>
                      <p className="admin-status-meta">
                        {pushDeviceCount
                          ? `${pushDeviceCount} Gerät registriert`
                          : "noch kein Push-Gerät"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary mt-3 w-full"
                    onClick={() => void enableNotifications()}
                    disabled={saving || notifPermission === "granted"}
                  >
                    {notifPermission === "granted"
                      ? "Benachrichtigungen aktiv"
                      : "Benachrichtigungen erlauben"}
                  </button>
                  <Field label="News-Titel">
                    <input
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className={fieldClass}
                      placeholder="Wassana News"
                    />
                  </Field>
                  <Field label="News-Text">
                    <textarea
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      className={fieldClass}
                      rows={3}
                      placeholder="Kurze Nachricht an die App…"
                    />
                  </Field>
                  <button
                    type="button"
                    className="btn-gold w-full"
                    onClick={() => void sendNewsNotification()}
                    disabled={saving}
                  >
                    News jetzt senden
                  </button>
                </Section>

                <StickySave saving={saving} label="Betriebsdaten speichern" />
              </form>
            ) : null}

            {error ? (
              <p className="admin-toast is-error">{error}</p>
            ) : null}
            {status ? <p className="admin-toast">{status}</p> : null}
          </>
        )}
      </main>

      {authed ? (
        <nav className="admin-tabbar fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto grid max-w-3xl grid-cols-7 gap-0.5 px-1.5 py-2 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError("");
                  setStatus("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  if (item.id === "inbox") void loadInbox();
                  if (item.id === "content" || item.id === "banner") {
                    void loadContent();
                  }
                  if (item.id === "menu") void loadWeekly();
                  if (item.id === "settings") void loadBusiness();
                }}
                className={`admin-tab ${tab === item.id ? "is-active" : ""}`}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <span className="admin-tab-glyph" aria-hidden>
                  <item.Icon className="admin-tab-icon" />
                </span>
                <span className="admin-tab-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
