"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { SiteContent } from "@/lib/site-content-shared";
import {
  ADMIN_PREVIEW_PARAM,
  CONTENT_FIELD_META,
  getContentPathValue,
  PREVIEW_DRAFT_MSG,
  PREVIEW_EDIT_MSG,
  PREVIEW_OPEN_POPUP_MSG,
  PREVIEW_READY_MSG,
  setContentPathValue,
} from "@/lib/content-paths";
import {
  Field,
  ScreenHeader,
  StickySave,
  type PublishPhase,
} from "./ui";

const fieldClass = "admin-field";

type PreviewPage = "home" | "speisekarte";

const PREVIEW_PAGES: { id: PreviewPage; label: string; path: string }[] = [
  { id: "home", label: "Startseite", path: "/" },
  { id: "speisekarte", label: "Speisekarte", path: "/speisekarte" },
];

export function AdminContentVisualEditor({
  content,
  setContent,
  saving,
  publishPhase,
  onSave,
}: {
  content: SiteContent;
  setContent: Dispatch<SetStateAction<SiteContent | null>>;
  saving: boolean;
  publishPhase: PublishPhase;
  onSave: (event: FormEvent) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [page, setPage] = useState<PreviewPage>("home");
  const [activePath, setActivePath] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [frameReady, setFrameReady] = useState(false);

  const previewSrc = useMemo(() => {
    const base =
      PREVIEW_PAGES.find((p) => p.id === page)?.path ?? "/";
    return `${base}?${ADMIN_PREVIEW_PARAM}=1`;
  }, [page]);

  const activeMeta = activePath ? CONTENT_FIELD_META[activePath] : null;
  const activeValue = activePath
    ? getContentPathValue(content, activePath)
    : "";

  const pushDraft = useCallback((path: string, value: string) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      { type: PREVIEW_DRAFT_MSG, path, value },
      window.location.origin,
    );
  }, []);

  const patchPath = useCallback(
    (path: string, value: string) => {
      setContent((prev) => {
        if (!prev) return prev;
        return setContentPathValue(prev, path, value);
      });
      pushDraft(path, value);
    },
    [pushDraft, setContent],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; path?: string } | null;
      if (!data?.type) return;
      if (data.type === PREVIEW_READY_MSG) {
        setFrameReady(true);
        return;
      }
      if (data.type === PREVIEW_EDIT_MSG && data.path) {
        setActivePath(data.path);
        setListOpen(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    setFrameReady(false);
  }, [previewSrc, frameKey]);

  function openPopup() {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_OPEN_POPUP_MSG },
      window.location.origin,
    );
  }

  const groupedFields = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const [path, meta] of Object.entries(CONTENT_FIELD_META)) {
      const group = meta.group || "Weitere";
      const list = groups.get(group) ?? [];
      list.push(path);
      groups.set(group, list);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <form onSubmit={onSave} className="admin-form admin-visual-editor space-y-3">
      <ScreenHeader
        kicker="Website"
        title="Texte"
        description="Vorschau der Website — tippe auf einen Text, um ihn zu ändern."
      />

      <div className="admin-visual-toolbar">
        <div className="admin-visual-pages" role="tablist" aria-label="Vorschau-Seite">
          {PREVIEW_PAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={page === item.id}
              className={`admin-visual-page-btn ${page === item.id ? "is-active" : ""}`}
              onClick={() => {
                setPage(item.id);
                setActivePath(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="admin-visual-actions">
          <button
            type="button"
            className="admin-chip"
            onClick={openPopup}
            disabled={!frameReady}
          >
            Mittag-Popup
          </button>
          <button
            type="button"
            className={`admin-chip ${listOpen ? "is-live" : ""}`}
            onClick={() => setListOpen((v) => !v)}
          >
            Alle Texte
          </button>
          <button
            type="button"
            className="admin-chip"
            onClick={() => {
              setFrameKey((k) => k + 1);
              setActivePath(null);
            }}
          >
            Neu laden
          </button>
        </div>
      </div>

      <p className="admin-visual-hint">
        Gelb umrandete Texte sind editierbar. Tippen → bearbeiten → unten
        veröffentlichen.
      </p>

      <div className="admin-visual-stage">
        <iframe
          key={`${previewSrc}-${frameKey}`}
          ref={iframeRef}
          src={previewSrc}
          title="Website-Vorschau zum Bearbeiten"
          className="admin-visual-frame"
        />

        {listOpen ? (
          <div className="admin-visual-list">
            <div className="admin-visual-list-head">
              <p className="admin-visual-list-title">Alle Texte</p>
              <button
                type="button"
                className="admin-chip"
                onClick={() => setListOpen(false)}
              >
                Schließen
              </button>
            </div>
            <div className="admin-visual-list-body">
              {groupedFields.map(([group, paths]) => (
                <div key={group} className="admin-visual-list-group">
                  <p className="admin-visual-list-group-title">{group}</p>
                  {paths.map((path) => {
                    const meta = CONTENT_FIELD_META[path];
                    const value = getContentPathValue(content, path);
                    return (
                      <button
                        key={path}
                        type="button"
                        className={`admin-visual-list-item ${activePath === path ? "is-active" : ""}`}
                        onClick={() => {
                          setActivePath(path);
                          if (path.startsWith("studentLunch.popup")) {
                            openPopup();
                          }
                        }}
                      >
                        <span className="admin-visual-list-item-label">
                          {meta?.label || path}
                        </span>
                        <span className="admin-visual-list-item-value">
                          {value.trim() || "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {activePath && activeMeta ? (
        <div className="admin-visual-sheet">
          <div className="admin-visual-sheet-head">
            <div>
              <p className="admin-kicker">{activeMeta.group || "Text"}</p>
              <p className="admin-visual-sheet-title">{activeMeta.label}</p>
            </div>
            <button
              type="button"
              className="admin-chip"
              onClick={() => setActivePath(null)}
            >
              Fertig
            </button>
          </div>
          <Field label={activeMeta.label} hint={activeMeta.hint}>
            {activeMeta.multiline ? (
              <textarea
                rows={4}
                value={activeValue}
                onChange={(e) => patchPath(activePath, e.target.value)}
                className={fieldClass}
                autoFocus
              />
            ) : (
              <input
                value={activeValue}
                onChange={(e) => patchPath(activePath, e.target.value)}
                className={fieldClass}
                autoFocus
              />
            )}
          </Field>
        </div>
      ) : null}

      <StickySave
        saving={saving}
        phase={publishPhase}
        label="Texte veröffentlichen"
      />
    </form>
  );
}
