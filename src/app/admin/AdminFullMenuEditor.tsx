"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
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

  return (
    <form onSubmit={onSave} className="admin-form space-y-3">
      <ScreenHeader
        kicker="Speisekarte"
        title="Alle Gerichte"
        description="Kategorien und Gerichte der kompletten Speisekarte — sortieren, anlegen, Preise und Texte ändern."
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

      <Section title="Hinweis">
        <p className="text-sm text-[color:var(--admin-muted)]">
          Das ist die feste Speisekarte unter der Wochenkarte. Mit ↑ ↓ sortierst
          du Kategorien und Gerichte. Nach dem Veröffentlichen ist alles live
          auf /speisekarte.
        </p>
      </Section>

      {menu.sections.map((section, sectionIndex) => (
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
                onClick={() => {
                  if (
                    window.confirm(
                      `Kategorie „${section.title || "ohne Titel"}“ wirklich löschen?`,
                    )
                  ) {
                    removeSection(sectionIndex);
                  }
                }}
                title="Kategorie löschen"
              >
                ×
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titel">
              <input
                value={section.title}
                onChange={(e) => {
                  const title = e.target.value;
                  updateSections((sections) => {
                    const copy = [...sections];
                    const current = copy[sectionIndex];
                    copy[sectionIndex] = {
                      ...current,
                      title,
                      id:
                        current.id === slugifyMenuId(current.title) ||
                        !current.id
                          ? slugifyMenuId(title)
                          : current.id,
                    };
                    return copy;
                  });
                }}
                className={fieldClass}
                placeholder="Hauptgerichte"
              />
            </Field>
            <Field
              label="Anker-ID"
              hint="für Sprungmarken auf der Seite, z. B. hauptgerichte"
            >
              <input
                value={section.id}
                onChange={(e) => {
                  const id = slugifyMenuId(e.target.value);
                  updateSections((sections) => {
                    const copy = [...sections];
                    copy[sectionIndex] = { ...copy[sectionIndex], id };
                    return copy;
                  });
                }}
                className={fieldClass}
                placeholder="hauptgerichte"
              />
            </Field>
          </div>
          <Field label="Hinweis unter dem Titel (optional)">
            <input
              value={section.note}
              onChange={(e) => {
                updateSections((sections) => {
                  const copy = [...sections];
                  copy[sectionIndex] = {
                    ...copy[sectionIndex],
                    note: e.target.value,
                  };
                  return copy;
                });
              }}
              className={fieldClass}
              placeholder="Optionaler Hinweis"
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
                key={`${section.id}-item-${itemIndex}`}
                className="admin-full-item"
              >
                <div className="admin-day-row-sort">
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label="Gericht nach oben"
                    disabled={itemIndex === 0}
                    onClick={() => moveItem(sectionIndex, itemIndex, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label="Gericht nach unten"
                    disabled={itemIndex === section.items.length - 1}
                    onClick={() => moveItem(sectionIndex, itemIndex, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-label="Gericht entfernen"
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
                      updateSections((sections) => {
                        const copy = [...sections];
                        const items = [...copy[sectionIndex].items];
                        items[itemIndex] = { ...item, nr: e.target.value };
                        copy[sectionIndex] = {
                          ...copy[sectionIndex],
                          items,
                        };
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
                      updateSections((sections) => {
                        const copy = [...sections];
                        const items = [...copy[sectionIndex].items];
                        items[itemIndex] = { ...item, name: e.target.value };
                        copy[sectionIndex] = {
                          ...copy[sectionIndex],
                          items,
                        };
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
                      updateSections((sections) => {
                        const copy = [...sections];
                        const items = [...copy[sectionIndex].items];
                        items[itemIndex] = { ...item, price: e.target.value };
                        copy[sectionIndex] = {
                          ...copy[sectionIndex],
                          items,
                        };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="Preis"
                  />
                  <input
                    aria-label="Kennzeichnung"
                    value={item.allergens}
                    onChange={(e) => {
                      updateSections((sections) => {
                        const copy = [...sections];
                        const items = [...copy[sectionIndex].items];
                        items[itemIndex] = {
                          ...item,
                          allergens: e.target.value,
                        };
                        copy[sectionIndex] = {
                          ...copy[sectionIndex],
                          items,
                        };
                        return copy;
                      });
                    }}
                    className={fieldClass}
                    placeholder="A,B"
                  />
                  <input
                    aria-label="Beschreibung"
                    value={item.description}
                    onChange={(e) => {
                      updateSections((sections) => {
                        const copy = [...sections];
                        const items = [...copy[sectionIndex].items];
                        items[itemIndex] = {
                          ...item,
                          description: e.target.value,
                        };
                        copy[sectionIndex] = {
                          ...copy[sectionIndex],
                          items,
                        };
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
      />
    </form>
  );
}
