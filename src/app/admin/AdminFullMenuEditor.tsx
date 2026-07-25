"use client";

import {
  useMemo,
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
      const copy = [...sections];
      copy[sectionIndex] = {
        ...section,
        items: [...section.items, blankMenuItem()],
      };
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
    <form onSubmit={onSave} className="admin-form space-y-3">
      <ScreenHeader
        kicker="Speisekarte"
        title="Alle Gerichte"
        description="Hier pflegst du die feste Speisekarte. Kein Code, kein Deploy — nur eingeben und veröffentlichen."
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
        <p className="admin-kicker">So geht’s live</p>
        <ol className="admin-live-steps">
          <li>
            <span className="admin-live-step-num">1</span>
            <span>
              Fehlende Gerichte mit <strong>+ Gericht</strong> oder{" "}
              <strong>+ Kategorie</strong> eintragen
            </span>
          </li>
          <li>
            <span className="admin-live-step-num">2</span>
            <span>
              Unten <strong>Speisekarte veröffentlichen</strong> tippen
            </span>
          </li>
          <li>
            <span className="admin-live-step-num">3</span>
            <span>
              Grün = sofort auf der Website unter /speisekarte (Live-Speicher /
              Vercel Blob)
            </span>
          </li>
        </ol>
        <p className="mt-3 text-sm text-[color:var(--admin-muted)]">
          GitHub ist nur optionales Backup. Für die öffentliche Seite reicht
          Veröffentlichen. Aktuell: {menu.sections.length} Kategorien ·{" "}
          {dishCount} Gerichte
          {menu.updatedAt
            ? ` · Stand ${new Intl.DateTimeFormat("de-DE", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(menu.updatedAt))}`
            : ""}
          .
        </p>
      </div>

      <Section title="Suchen & Hinweis">
        <Field label="Gericht oder Kategorie suchen">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-menu-search"
            placeholder="z. B. Pad Thai, Vorspeisen, Nr. 12 …"
            autoComplete="off"
          />
        </Field>
        <p className="text-sm text-[color:var(--admin-muted)]">
          Steht unter den beliebten Gerichten der Woche. Mit ↑ ↓ sortieren.
          Kennzeichnung z. B. A,B,C.
        </p>
      </Section>

      {filteredSections.length === 0 ? (
        <p className="admin-empty">
          Nichts gefunden für „{search.trim()}“. Suche leeren oder neues Gericht
          anlegen.
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
                className="admin-sort-btn"
                aria-label="Kategorie entfernen"
                disabled={menu.sections.length <= 1}
                onClick={() => removeSection(sectionIndex)}
                title="Entfernen"
              >
                ×
              </button>
            </>
          }
        >
          <Field label="Titel der Kategorie">
            <input
              value={section.title}
              onChange={(e) => {
                const title = e.target.value;
                updateSections((sections) => {
                  const copy = [...sections];
                  const current = copy[sectionIndex];
                  if (!current) return sections;
                  copy[sectionIndex] = {
                    ...current,
                    title,
                    id: current.id || slugifyMenuId(title),
                  };
                  return copy;
                });
              }}
              className={fieldClass}
              placeholder="z. B. Hauptgerichte"
            />
          </Field>
          <Field
            label="Technische ID"
            hint="für Sprungmarken auf der Seite, z. B. hauptgerichte"
          >
            <input
              value={section.id}
              onChange={(e) => {
                const id = e.target.value;
                updateSections((sections) => {
                  const copy = [...sections];
                  const current = copy[sectionIndex];
                  if (!current) return sections;
                  copy[sectionIndex] = { ...current, id };
                  return copy;
                });
              }}
              className={fieldClass}
              placeholder="hauptgerichte"
            />
          </Field>
          <Field label="Hinweis unter dem Titel (optional)">
            <input
              value={section.note || ""}
              onChange={(e) => {
                const note = e.target.value;
                updateSections((sections) => {
                  const copy = [...sections];
                  const current = copy[sectionIndex];
                  if (!current) return sections;
                  copy[sectionIndex] = { ...current, note };
                  return copy;
                });
              }}
              className={fieldClass}
              placeholder="optional"
            />
          </Field>

          <div className="admin-day-grid">
            <div className="admin-day-grid-head">
              <p className="admin-day-grid-label">
                Gerichte · {section.items.length}
              </p>
              <button
                type="button"
                className="btn-gold !px-3 !py-1.5 text-sm"
                disabled={section.items.length >= 80}
                onClick={() => addItem(sectionIndex)}
              >
                + Gericht
              </button>
            </div>

            {section.items.map((item, itemIndex) => (
              <div
                key={`${section.id}-${itemIndex}`}
                className="admin-full-item"
              >
                <div className="admin-day-row-sort">
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label={`Gericht ${itemIndex + 1} nach oben`}
                    disabled={itemIndex === 0}
                    onClick={() => moveItem(sectionIndex, itemIndex, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label={`Gericht ${itemIndex + 1} nach unten`}
                    disabled={itemIndex === section.items.length - 1}
                    onClick={() => moveItem(sectionIndex, itemIndex, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label={`Gericht ${itemIndex + 1} entfernen`}
                    disabled={section.items.length <= 1}
                    onClick={() => removeItem(sectionIndex, itemIndex)}
                    title="Entfernen"
                  >
                    ×
                  </button>
                </div>
                <div className="admin-full-item-fields">
                  <input
                    aria-label="Nr"
                    value={item.nr}
                    onChange={(e) => {
                      const nr = e.target.value;
                      updateSections((sections) => {
                        const copy = [...sections];
                        const current = copy[sectionIndex];
                        if (!current) return sections;
                        const items = [...current.items];
                        items[itemIndex] = { ...items[itemIndex], nr };
                        copy[sectionIndex] = { ...current, items };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="Nr"
                  />
                  <input
                    aria-label="Name"
                    value={item.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      updateSections((sections) => {
                        const copy = [...sections];
                        const current = copy[sectionIndex];
                        if (!current) return sections;
                        const items = [...current.items];
                        items[itemIndex] = { ...items[itemIndex], name };
                        copy[sectionIndex] = { ...current, items };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="Name"
                  />
                  <input
                    aria-label="Preis"
                    value={item.price}
                    onChange={(e) => {
                      const price = e.target.value;
                      updateSections((sections) => {
                        const copy = [...sections];
                        const current = copy[sectionIndex];
                        if (!current) return sections;
                        const items = [...current.items];
                        items[itemIndex] = { ...items[itemIndex], price };
                        copy[sectionIndex] = { ...current, items };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="Preis"
                  />
                  <input
                    aria-label="Kennzeichnung"
                    value={item.allergens || ""}
                    onChange={(e) => {
                      const allergens = e.target.value;
                      updateSections((sections) => {
                        const copy = [...sections];
                        const current = copy[sectionIndex];
                        if (!current) return sections;
                        const items = [...current.items];
                        items[itemIndex] = { ...items[itemIndex], allergens };
                        copy[sectionIndex] = { ...current, items };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="A,B"
                  />
                  <input
                    aria-label="Beschreibung"
                    value={item.description || ""}
                    onChange={(e) => {
                      const description = e.target.value;
                      updateSections((sections) => {
                        const copy = [...sections];
                        const current = copy[sectionIndex];
                        if (!current) return sections;
                        const items = [...current.items];
                        items[itemIndex] = {
                          ...items[itemIndex],
                          description,
                        };
                        copy[sectionIndex] = { ...current, items };
                        return copy;
                      });
                    }}
                    className={`${fieldClass} admin-full-item-desc`}
                    placeholder="Beschreibung (optional)"
                  />
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
        hint="Speichert in den Live-Speicher (Vercel Blob) — ohne Code und ohne Deploy. Grün = auf der Website."
      />
    </form>
  );
}
