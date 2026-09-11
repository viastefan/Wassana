"use client";

import type { Dispatch, SetStateAction } from "react";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store-shared";
import { WEEKLY_TABLE_SIZE } from "@/lib/weekly-menu-store-shared";
import { Field, Section } from "./ui";

export function AdminWeeklyTable({
  weekly,
  setWeekly,
}: {
  weekly: WeeklyMenuData;
  setWeekly: Dispatch<SetStateAction<WeeklyMenuData | null>>;
}) {
  const table = weekly.table || [];

  function updateRow(index: number, field: "dish" | "price", value: string) {
    setWeekly((prev) => {
      if (!prev) return prev;
      const next = Array.from({ length: WEEKLY_TABLE_SIZE }, (_, i) => {
        return prev.table?.[i] || { dish: "", price: "" };
      });
      next[index] = { ...next[index], [field]: value };
      return { ...prev, table: next };
    });
  }

  return (
    <Section title="Diese Woche">
      <Field
        label="Hinweis über der Karte"
        hint="z. B. Alle Speisen werden mit Duftreis serviert"
      >
        <input
          value={weekly.note}
          onChange={(e) => setWeekly({ ...weekly, note: e.target.value })}
          className="admin-field"
          placeholder="optional"
        />
      </Field>
      <div className="admin-menu-table-wrap">
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th className="admin-menu-table-nr">Nr</th>
              <th>Gericht</th>
              <th>Preis</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: WEEKLY_TABLE_SIZE }, (_, index) => {
              const row = table[index] || { dish: "", price: "" };
              return (
                <tr key={index}>
                  <td className="admin-menu-table-nr">{index + 1}</td>
                  <td>
                    <input
                      aria-label={`Zeile ${index + 1} Gericht`}
                      value={row.dish}
                      onChange={(e) =>
                        updateRow(index, "dish", e.target.value)
                      }
                      className="admin-field"
                      placeholder="Gericht"
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Zeile ${index + 1} Preis`}
                      value={row.price}
                      onChange={(e) =>
                        updateRow(index, "price", e.target.value)
                      }
                      className="admin-field"
                      placeholder="z. B. 8,90 €"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
