"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  blankMenuItem,
  blankMenuSection,
  slugifyMenuId,
  type FullMenuData,
  type FullMenuItem,
  type FullMenuSection,
} from "@/lib/menu-store-shared";
import {
  Field,
  ScreenHeader,
  Section,
  StickySave,
  type PublishPhase,
} from "./ui";

const fieldClass = "admin-field";

type EditTarget =
  | { kind: "item"; sectionIndex: number; itemIndex: number }
  | { kind: "section"; sectionIndex: number }
  | null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AdminFullMenuEditor({
  menu,
  setMenu,
  saving,
  publishPhase,
  onSave,
}: {
  menu: FullMenuData;
  setMenu: Dispatch<SetStateAction<FullMenuData | null>>;
  saving: boolean;
  publishPhase: PublishPhase;
  onSave: (event: FormEvent) => void;
}) {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [draftItem, setDraftItem] = useState<FullMenuItem | null>(null);
  const [draftSection, setDraftSection] = useState<FullMenuSection | null>(
    null,
  );
  const [sheetSaving, setSheetSaving] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  function updateSections(
    updater: (sections: FullMenuSection[]) => FullMenuSection[],
  ) {
    setMenu((prev) => {
      if (!prev) return prev;
      return { ...prev, sections: updater(prev.sections) };
    });
  }

  function moveSection(index: number, dir: -1 | 1) {
    updateSections((sections) => {
      const next = index + dir;
      if (next < 0 || next >= sections.length) return sections;
      const copy = [...sections];
      const temp = copy[index];
      copy[index] = copy[next];
      copy[next] = temp;
      return copy;
    });
  }

  function moveItem(sectionIndex: number, itemIndex: number, dir: -1 | 1) {
    updateSections((sections) => {
      const section = sections[sectionIndex];
      if (!section) return sections;
      const next = itemIndex + dir;
      if (next < 0 || next >= section.items.length) return sections;
      const items = [...section.items];
      const temp = items[itemIndex];
      items[itemIndex] = items[next];
      items[next] = temp;
      const copy = [...sections];
      copy[sectionIndex] = { ...section, items };
      return copy;
    });
  }

  function addSection() {
    updateSections((sections) => {
      if (sections.length >= 30) return sections;
      return [...sections, blankMenuSection(`Kategorie ${sections.length + 1}`)];
    });
  }

  function removeSection(index: number) {
    updateSections((sections) => {
      if (sections.length <= 1) return sections;
      return sections.filter((_, i) => i !== index);
    });
  }

  function addItem(sectionIndex: number) {
    updateSections((sections) => {
      const section = sections[sectionIndex];
      if (!section || section.items.length >= 80) return sections;
      const items = [...section.items, blankMenuItem()];
      const copy = [...sections];
      copy[sectionIndex] = { ...section, items };
      const itemIndex = items.length - 1;
      queueMicrotask(() => {
        setEditTarget({ kind: "item", sectionIndex, itemIndex });
        setDraftItem({ ...items[itemIndex] });
      });
      return copy;
    });
  }

  function removeItem(sectionIndex: number, itemIndex: number) {
    updateSections((sections) => {
      const section = sections[sectionIndex];
      if (!section || section.items.length <= 1) return sections;
      const copy = [...sections];
      copy[sectionIndex] = {
        ...section,
        items: section.items.filter((_, i) => i !== itemIndex),
      };
      return copy;
    });
  }

  function openItem(sectionIndex: number, itemIndex: number) {
    const item = menu.sections[sectionIndex]?.items[itemIndex];
    if (!item) return;
    setDraftItem({ ...item });
    setDraftSection(null);
    setEditTarget({ kind: "item", sectionIndex, itemIndex });
  }

  function openSection(sectionIndex: number) {
    const section = menu.sections[sectionIndex];
    if (!section) return;
    setDraftSection({ ...section });
    setDraftItem(null);
    setEditTarget({ kind: "section", sectionIndex });
  }

  function closeSheet() {
    if (sheetSaving) return;
    setEditTarget(null);
    setDraftItem(null);
    setDraftSection(null);
  }

  async function saveSheet() {
    if (!editTarget || sheetSaving) return;
    setSheetSaving(true);
    await sleep(2000);

    if (editTarget.kind === "item" && draftItem) {
      const { sectionIndex, itemIndex } = editTarget;
      updateSections((sections) => {
        const section = sections[sectionIndex];
        if (!section) return sections;
        const items = [...section.items];
        items[itemIndex] = { ...draftItem };
        const copy = [...sections];
        copy[sectionIndex] = { ...section, items };
        return copy;
      });
    }

    if (editTarget.kind === "section" && draftSection) {
      const { sectionIndex } = editTarget;
      updateSections((sections) => {
        const copy = [...sections];
        const current = copy[sectionIndex];
        if (!current) return sections;
        copy[sectionIndex] = {
          ...current,
          title: draftSection.title,
          id: draftSection.id || slugifyMenuId(draftSection.title),
          note: draftSection.note || "",
        };
        return copy;
      });
    }

    setSheetSaving(false);
    setEditTarget(null);
    setDraftItem(null);
    setDraftSection(null);
  }

  useEffect(() => {
    if (!editTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sheetSaving) closeSheet();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget, sheetSaving]);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return menu.sections.map((section, index) => ({ section, index }));
    }
    return menu.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => {
        const hay = [
          section.title,
          section.note,
          section.id,
          ...section.items.flatMap((item) => [
            item.nr,
            item.name,
            item.description,
            item.price,
            item.allergens,
          ]),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [menu.sections, search]);

  const dishCount = menu.sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  return (
    <>
      <form onSubmit={onSave} className="admin-form space-y-3">
        <ScreenHeader
          kicker="Speisekarte"
          title="Alle Gerichte"
          description="Liste scrollen, Gericht tippen zum Bearbeiten. Veröffentlichen unten macht alles live."
          action={
            <button
              type="button"
              className="btn-primary !px-3 !py-2 text-sm"
              disabled={menu.sections.length >= 30}
              onClick={addSection}
            >
              + Kategorie
            </button>
          }
        />

        <div className="admin-live-hero">
          <p className="admin-kicker">So geht’s</p>
          <ol className="admin-live-steps">
            <li>
              <span className="admin-live-step-num">1</span>
              <span>Durch die Karte scrollen und Gerichte finden</span>
            </li>
            <li>
              <span className="admin-live-step-num">2</span>
              <span>
                <strong>Bearbeiten</strong> öffnet das Sheet — Speichern dauert
                ca. 2 Sekunden
              </span>
            </li>
            <li>
              <span className="admin-live-step-num">3</span>
              <span>
                Unten <strong>veröffentlichen</strong> = sofort live auf der
                Website
              </span>
            </li>
          </ol>
          <p className="mt-3 text-sm text-[color:var(--admin-muted)]">
            Aktuell: {menu.sections.length} Kategorien · {dishCount} Gerichte
            {menu.updatedAt
              ? ` · Stand ${new Intl.DateTimeFormat("de-DE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(menu.updatedAt))}`
              : ""}
            .
          </p>
        </div>

        <Section title="Suchen">
          <Field label="Gericht oder Kategorie">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-menu-search"
              placeholder="z. B. Pad Thai, Vorspeisen, Nr. 12 …"
              autoComplete="off"
            />
          </Field>
        </Section>

        {filteredSections.length === 0 ? (
          <p className="admin-empty">
            Nichts gefunden für „{search.trim()}“.
          </p>
        ) : null}

        {filteredSections.map(({ section, index: sectionIndex }) => (
          <Section
            key={`${section.id}-${sectionIndex}`}
            title={section.title || `Kategorie ${sectionIndex + 1}`}
            action={
              <>
                <button
                  type="button"
                  className="admin-sort-btn"
                  aria-label="Kategorie nach oben"
                  disabled={sectionIndex === 0}
                  onClick={() => moveSection(sectionIndex, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-sort-btn"
                  aria-label="Kategorie nach unten"
                  disabled={sectionIndex === menu.sections.length - 1}
                  onClick={() => moveSection(sectionIndex, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn-gold !px-2.5 !py-1.5 text-xs"
                  onClick={() => openSection(sectionIndex)}
                >
                  Kategorie
                </button>
                <button
                  type="button"
                  className="btn-gold !px-2.5 !py-1.5 text-xs"
                  disabled={section.items.length >= 80}
                  onClick={() => addItem(sectionIndex)}
                >
                  + Gericht
                </button>
              </>
            }
          >
            <div className="admin-dish-list">
              {section.items.map((item, itemIndex) => (
                <div
                  key={`${section.id}-${itemIndex}-${item.nr}`}
                  className="admin-dish-row"
                >
                  <div className="admin-dish-row-main">
                    <p className="admin-dish-row-title">
                      <span className="admin-dish-row-nr">
                        {item.nr || "–"}
                      </span>{" "}
                      {item.name || "Ohne Namen"}
                    </p>
                    <p className="admin-dish-row-meta">
                      {item.price || "kein Preis"}
                      {item.allergens ? ` · ${item.allergens}` : ""}
                      {item.description
                        ? ` · ${item.description.slice(0, 48)}${
                            item.description.length > 48 ? "…" : ""
                          }`
                        : ""}
                    </p>
                  </div>
                  <div className="admin-dish-row-actions">
                    <button
                      type="button"
                      className="admin-sort-btn"
                      aria-label="Nach oben"
                      disabled={itemIndex === 0}
                      onClick={() => moveItem(sectionIndex, itemIndex, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-sort-btn"
                      aria-label="Nach unten"
                      disabled={itemIndex === section.items.length - 1}
                      onClick={() => moveItem(sectionIndex, itemIndex, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn-primary !px-3 !py-1.5 text-sm"
                      onClick={() => openItem(sectionIndex, itemIndex)}
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ))}

        <StickySave
          saving={saving}
          phase={publishPhase}
          label="Speisekarte veröffentlichen"
          hint="Speichert in den Live-Speicher — ohne Code und ohne Deploy. Grün = auf der Website."
        />
      </form>

      {editTarget ? (
        <div
          className="admin-sheet-root"
          role="presentation"
          onClick={() => {
            if (!sheetSaving) closeSheet();
          }}
        >
          <div
            className="admin-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-sheet-handle" aria-hidden />
            <div className="admin-sheet-top">
              <div>
                <p className="admin-kicker">
                  {editTarget.kind === "item" ? "Gericht" : "Kategorie"}
                </p>
                <h2
                  id={titleId}
                  className="font-display mt-1 text-2xl text-[color:var(--admin-burgundy)]"
                >
                  {editTarget.kind === "item"
                    ? draftItem?.name || "Gericht bearbeiten"
                    : draftSection?.title || "Kategorie bearbeiten"}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="admin-sheet-close"
                onClick={closeSheet}
                disabled={sheetSaving}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            <div className="admin-sheet-body">
              {editTarget.kind === "item" && draftItem ? (
                <>
                  <Field label="Nr">
                    <input
                      value={draftItem.nr}
                      onChange={(e) =>
                        setDraftItem({ ...draftItem, nr: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="Nr"
                    />
                  </Field>
                  <Field label="Name">
                    <input
                      value={draftItem.name}
                      onChange={(e) =>
                        setDraftItem({ ...draftItem, name: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="Name"
                    />
                  </Field>
                  <Field label="Preis">
                    <input
                      value={draftItem.price}
                      onChange={(e) =>
                        setDraftItem({ ...draftItem, price: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="z. B. 9,90 €"
                    />
                  </Field>
                  <Field label="Kennzeichnung" hint="z. B. A,B,C">
                    <input
                      value={draftItem.allergens}
                      onChange={(e) =>
                        setDraftItem({
                          ...draftItem,
                          allergens: e.target.value,
                        })
                      }
                      className={fieldClass}
                      placeholder="A,B"
                    />
                  </Field>
                  <Field label="Beschreibung">
                    <textarea
                      value={draftItem.description}
                      onChange={(e) =>
                        setDraftItem({
                          ...draftItem,
                          description: e.target.value,
                        })
                      }
                      className={fieldClass}
                      rows={3}
                      placeholder="optional"
                    />
                  </Field>
                </>
              ) : null}

              {editTarget.kind === "section" && draftSection ? (
                <>
                  <Field label="Titel">
                    <input
                      value={draftSection.title}
                      onChange={(e) =>
                        setDraftSection({
                          ...draftSection,
                          title: e.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field
                    label="Technische ID"
                    hint="für Sprungmarken, z. B. hauptgerichte"
                  >
                    <input
                      value={draftSection.id}
                      onChange={(e) =>
                        setDraftSection({
                          ...draftSection,
                          id: e.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Hinweis unter dem Titel">
                    <input
                      value={draftSection.note}
                      onChange={(e) =>
                        setDraftSection({
                          ...draftSection,
                          note: e.target.value,
                        })
                      }
                      className={fieldClass}
                      placeholder="optional"
                    />
                  </Field>
                  <button
                    type="button"
                    className="btn-gold w-full"
                    disabled={menu.sections.length <= 1 || sheetSaving}
                    onClick={() => {
                      removeSection(editTarget.sectionIndex);
                      closeSheet();
                    }}
                  >
                    Kategorie löschen
                  </button>
                </>
              ) : null}
            </div>

            <div className="admin-sheet-footer">
              {editTarget.kind === "item" ? (
                <button
                  type="button"
                  className="btn-gold"
                  disabled={
                    sheetSaving ||
                    (menu.sections[editTarget.sectionIndex]?.items.length ||
                      0) <= 1
                  }
                  onClick={() => {
                    removeItem(editTarget.sectionIndex, editTarget.itemIndex);
                    closeSheet();
                  }}
                >
                  Löschen
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-gold"
                  disabled={sheetSaving}
                  onClick={closeSheet}
                >
                  Abbrechen
                </button>
              )}
              <button
                type="button"
                className={`btn-primary admin-sheet-save ${
                  sheetSaving ? "is-loading" : ""
                }`}
                disabled={sheetSaving}
                onClick={() => void saveSheet()}
              >
                <span
                  className={`admin-sticky-save-fill ${
                    sheetSaving ? "is-active" : ""
                  }`}
                  aria-hidden
                />
                <span className="admin-sticky-save-label">
                  {sheetSaving ? "Speichern …" : "Speichern"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
