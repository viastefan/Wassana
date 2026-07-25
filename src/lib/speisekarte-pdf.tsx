import path from "path";
import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ResolvedBusiness } from "@/lib/business-profile-shared";
import type { MenuSection } from "@/lib/menu";
import { allergens } from "@/lib/menu";
import type { WeeklyMenuData } from "@/lib/weekly-menu-store";

Font.register({
  family: "SpecialElite",
  src: path.join(process.cwd(), "public/fonts/SpecialElite-Regular.ttf"),
});

const colors = {
  bg: "#f3eee4",
  paper: "#f7f3ea",
  ink: "#1e2129",
  muted: "#4a505c",
  line: "#d5cdbf",
  red: "#7a0c24",
  gold: "#b59551",
  goldSoft: "#cbb892",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
  },
  brandBlock: {
    flexGrow: 1,
    flexShrink: 1,
  },
  brand: {
    fontFamily: "SpecialElite",
    fontSize: 28,
    color: colors.red,
    letterSpacing: 1.5,
  },
  brandSub: {
    marginTop: 4,
    fontFamily: "SpecialElite",
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  metaBlock: {
    alignItems: "flex-end",
    maxWidth: 170,
  },
  metaLine: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "right",
    lineHeight: 1.45,
  },
  metaStrong: {
    fontFamily: "SpecialElite",
    fontSize: 9,
    color: colors.ink,
    textAlign: "right",
    marginBottom: 2,
  },
  rule: {
    marginTop: 14,
    height: 1,
    backgroundColor: colors.gold,
  },
  ruleSoft: {
    marginTop: 8,
    marginBottom: 10,
    height: 0.6,
    backgroundColor: colors.goldSoft,
  },
  docTitleRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  docTitle: {
    fontFamily: "SpecialElite",
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.6,
  },
  docDate: {
    fontSize: 8,
    color: colors.muted,
  },
  intro: {
    marginTop: 8,
    fontSize: 8.5,
    color: colors.muted,
    lineHeight: 1.45,
    maxWidth: 420,
  },
  section: {
    marginTop: 16,
  },
  sectionKicker: {
    fontSize: 7.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.gold,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: "SpecialElite",
    fontSize: 14,
    color: colors.red,
    marginBottom: 2,
  },
  sectionNote: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  weekGrid: {
    marginTop: 6,
    gap: 8,
  },
  weekDay: {
    paddingTop: 7,
    paddingBottom: 7,
    borderTopWidth: 0.6,
    borderTopColor: colors.line,
  },
  weekDayName: {
    fontSize: 7.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.gold,
  },
  weekDish: {
    marginTop: 2,
    fontFamily: "SpecialElite",
    fontSize: 11,
    color: colors.ink,
  },
  weekDesc: {
    marginTop: 2,
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.35,
  },
  weekVariants: {
    marginTop: 5,
    gap: 2,
  },
  weekVariantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  weekVariantName: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 8.5,
    color: colors.ink,
  },
  weekVariantPrice: {
    fontSize: 8.5,
    color: colors.red,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  itemNr: {
    width: 28,
    fontSize: 8,
    color: colors.gold,
    paddingTop: 1,
  },
  itemBody: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 9.5,
    color: colors.ink,
    lineHeight: 1.3,
  },
  itemMarks: {
    fontSize: 7,
    color: colors.gold,
  },
  itemDesc: {
    marginTop: 1,
    fontSize: 7.5,
    color: colors.muted,
    lineHeight: 1.35,
  },
  itemPrice: {
    width: 72,
    textAlign: "right",
    fontSize: 9,
    color: colors.red,
    paddingTop: 1,
  },
  legendGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  legendItem: {
    width: "48%",
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  legendCode: {
    width: 14,
    fontSize: 8,
    color: colors.gold,
  },
  legendLabel: {
    flexGrow: 1,
    fontSize: 7.5,
    color: colors.muted,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.6,
    borderTopColor: colors.goldSoft,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
  footerBrand: {
    fontFamily: "SpecialElite",
    fontSize: 8,
    color: colors.gold,
  },
});

function formatPdfDate(date = new Date()) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ItemLine({
  nr,
  name,
  description,
  price,
  marks,
}: {
  nr?: string;
  name: string;
  description?: string;
  price: string;
  marks?: string;
}) {
  return (
    <View style={styles.itemRow} wrap={false}>
      <Text style={styles.itemNr}>{nr?.trim() || "–"}</Text>
      <View style={styles.itemBody}>
        <Text style={styles.itemName}>
          {name}
          {marks?.trim() ? (
            <Text style={styles.itemMarks}> {marks.trim()}</Text>
          ) : null}
        </Text>
        {description?.trim() ? (
          <Text style={styles.itemDesc}>{description.trim()}</Text>
        ) : null}
      </View>
      <Text style={styles.itemPrice}>{price}</Text>
    </View>
  );
}

export function SpeisekartePdfDocument({
  weekly,
  sections,
  business,
  siteUrl,
}: {
  weekly: WeeklyMenuData;
  sections: MenuSection[];
  business: ResolvedBusiness;
  siteUrl: string;
}) {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Document
      title={`Speisekarte · ${business.shortName}`}
      author={business.fullName}
      subject="Thai Speisekarte Landshut"
      language="de-DE"
      creator="Wassana Thai Imbiss"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed={false}>
          <View style={styles.brandRow}>
            <View style={styles.brandBlock}>
              <Text style={styles.brand}>Wassana</Text>
              <Text style={styles.brandSub}>Thai Imbiss · Landshut</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaStrong}>{business.street}</Text>
              <Text style={styles.metaLine}>
                {business.zip} {business.city}
              </Text>
              <Text style={styles.metaLine}>{business.phone}</Text>
              <Text style={styles.metaLine}>Mo–Fr 11:00–18:00</Text>
            </View>
          </View>
          <View style={styles.rule} />
          <View style={styles.docTitleRow}>
            <Text style={styles.docTitle}>Speisekarte</Text>
            <Text style={styles.docDate}>{formatPdfDate()}</Text>
          </View>
          <Text style={styles.intro}>
            Frisch zubereitet — Currys, Wok, Suppen und mehr. Gerne auch zum
            Mitnehmen. Schärfe nach Wunsch. Alle Preise in Euro.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>Diese Woche</Text>
          <Text style={styles.sectionTitle}>Beliebte Gerichte der Woche</Text>
          {weekly.note?.trim() ? (
            <Text style={styles.sectionNote}>{weekly.note.trim()}</Text>
          ) : null}
          <View style={styles.ruleSoft} />
          <View style={styles.weekGrid}>
            {weekly.days.map((day, index) => (
              <View
                key={`${day.day}-${index}`}
                style={styles.weekDay}
                wrap={false}
              >
                <Text style={styles.weekDayName}>{day.day}</Text>
                <Text style={styles.weekDish}>
                  {day.dish}
                  {day.allergens?.trim() ? (
                    <Text style={styles.itemMarks}> {day.allergens.trim()}</Text>
                  ) : null}
                </Text>
                {day.description?.trim() ? (
                  <Text style={styles.weekDesc}>{day.description.trim()}</Text>
                ) : null}
                <View style={styles.weekVariants}>
                  {day.items.map((item, itemIndex) => (
                    <View
                      key={`${day.day}-${item.nr}-${itemIndex}`}
                      style={styles.weekVariantRow}
                    >
                      <Text style={styles.weekVariantName}>
                        <Text style={{ color: colors.gold }}>
                          {item.nr?.trim() || "–"}{" "}
                        </Text>
                        {item.name}
                        {item.allergens?.trim() ? (
                          <Text style={styles.itemMarks}>
                            {" "}
                            {item.allergens.trim()}
                          </Text>
                        ) : null}
                      </Text>
                      <Text style={styles.weekVariantPrice}>{item.price}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.id} style={styles.section} wrap>
            <Text style={styles.sectionKicker}>Speisekarte</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.note?.trim() ? (
              <Text style={styles.sectionNote}>{section.note.trim()}</Text>
            ) : null}
            <View style={styles.ruleSoft} />
            {section.items.map((item, index) => (
              <ItemLine
                key={`${section.id}-${item.nr}-${index}`}
                nr={item.nr}
                name={item.name}
                description={item.description}
                price={item.price}
                marks={item.allergens}
              />
            ))}
          </View>
        ))}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionKicker}>Hinweise</Text>
          <Text style={styles.sectionTitle}>Kennzeichnung</Text>
          <Text style={styles.sectionNote}>
            Hochgestellte Zeichen stehen für Zusatzstoffe und Allergene. Schärfe
            nach Wunsch. Extra Soße 0,10 €. Getränke mit * inkl. 0,15 € Pfand.
          </Text>
          <View style={styles.ruleSoft} />
          <View style={styles.legendGrid}>
            {allergens.map((item) => (
              <View key={item.code} style={styles.legendItem}>
                <Text style={styles.legendCode}>{item.code}</Text>
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {business.fullName} · {business.phone}
          </Text>
          <Text style={styles.footerBrand}>{host}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
