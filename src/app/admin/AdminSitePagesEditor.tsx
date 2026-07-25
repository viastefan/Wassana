"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SitePages } from "@/lib/site-pages-shared";
import {
  Field,
  ScreenHeader,
  Section,
  StickySave,
  type PublishPhase,
} from "./ui";

const fieldClass = "admin-field";
const MAX_FAQS = 12;

type TabId =
  | "allgemein"
  | "start"
  | "speisekarte"
  | "catering"
  | "kochkurs"
  | "mitnehmen"
  | "ueberUns"
  | "anfahrt"
  | "kontakt"
  | "faq"
  | "formular";

const TABS: { id: TabId; label: string }[] = [
  { id: "allgemein", label: "Allgemein" },
  { id: "start", label: "Start" },
  { id: "speisekarte", label: "Speisekarte" },
  { id: "catering", label: "Catering" },
  { id: "kochkurs", label: "Kochkurs" },
  { id: "mitnehmen", label: "Mitnehmen" },
  { id: "ueberUns", label: "Über uns" },
  { id: "anfahrt", label: "Anfahrt" },
  { id: "kontakt", label: "Kontakt" },
  { id: "faq", label: "FAQ" },
  { id: "formular", label: "Formular" },
];

const Text = memo(function Text({
  label,
  value,
  onChange,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      )}
    </Field>
  );
});

export function AdminSitePagesEditor({
  pages,
  saving,
  publishPhase,
  onSave,
}: {
  pages: SitePages;
  saving: boolean;
  publishPhase: PublishPhase;
  onSave: (next: SitePages) => void;
}) {
  const [draft, setDraft] = useState(pages);
  const [tab, setTab] = useState<TabId>("allgemein");
  const tabsRef = useRef<HTMLDivElement>(null);

  // Sync only when server payload version changes; key remount covers full resets.
  useEffect(() => {
    setDraft(pages);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: pages.updatedAt
  }, [pages.updatedAt]);

  function update(updater: (prev: SitePages) => SitePages) {
    setDraft((prev) => updater(prev));
  }

  function selectTab(id: TabId, button: HTMLButtonElement) {
    setTab(id);
    tabsRef.current?.scrollIntoView({ block: "start" });
    button.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="admin-form space-y-3"
    >
      <ScreenHeader
        kicker="Website"
        title="Alle Texte"
        description="Jeder Abschnitt spiegelt die Live-Seite wider — Navigation, Footer, Hero-Texte und Formulare. Veröffentlichen = sofort live."
      />

      <div
        ref={tabsRef}
        className="admin-page-tabs admin-page-tabs--sticky mb-3 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Seitenbereich"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`admin-chip shrink-0 ${active ? "is-active" : ""}`}
              onClick={(e) => selectTab(item.id, e.currentTarget)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "allgemein" ? (
        <>
          <Section title="Skip-Link & Navigation">
            <Text
              label="Skip-Link (Barrierefreiheit)"
              value={draft.chrome.skipLink}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: { ...p.chrome, skipLink: value },
                }))
              }
            />
            <Text
              label="Nav · Start"
              value={draft.chrome.nav.start}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    nav: { ...p.chrome.nav, start: value },
                  },
                }))
              }
            />
            <Text
              label="Nav · Speisekarte"
              value={draft.chrome.nav.speisekarte}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    nav: { ...p.chrome.nav, speisekarte: value },
                  },
                }))
              }
            />
            <Text
              label="Nav · Catering"
              value={draft.chrome.nav.catering}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    nav: { ...p.chrome.nav, catering: value },
                  },
                }))
              }
            />
            <Text
              label="Nav · Kochkurs"
              value={draft.chrome.nav.kochkurs}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    nav: { ...p.chrome.nav, kochkurs: value },
                  },
                }))
              }
            />
            <Text
              label="Nav · Kontakt"
              value={draft.chrome.nav.kontakt}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    nav: { ...p.chrome.nav, kontakt: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Kontakt-Menü (Header)">
            <Text
              label="Kontaktanfrage · Titel"
              value={draft.chrome.contactMenu.inquiry}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: { ...p.chrome.contactMenu, inquiry: value },
                  },
                }))
              }
            />
            <Text
              label="Kontaktanfrage · Hinweis"
              value={draft.chrome.contactMenu.inquiryHint}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: {
                      ...p.chrome.contactMenu,
                      inquiryHint: value,
                    },
                  },
                }))
              }
            />
            <Text
              label="Menü · E-Mail"
              value={draft.chrome.contactMenu.email}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: { ...p.chrome.contactMenu, email: value },
                  },
                }))
              }
            />
            <Text
              label="Menü · Anrufen"
              value={draft.chrome.contactMenu.call}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: { ...p.chrome.contactMenu, call: value },
                  },
                }))
              }
            />
            <Text
              label="Menü öffnen (Aria)"
              value={draft.chrome.contactMenu.openMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: { ...p.chrome.contactMenu, openMenu: value },
                  },
                }))
              }
            />
            <Text
              label="Menü schließen (Aria)"
              value={draft.chrome.contactMenu.closeMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    contactMenu: { ...p.chrome.contactMenu, closeMenu: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Footer · Spalten & Links">
            <Text
              label="Footer · Entdecken-Überschrift"
              value={draft.chrome.footer.exploreLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, exploreLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Öffnungszeiten-Überschrift"
              value={draft.chrome.footer.hoursLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, hoursLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Kontakt-Überschrift"
              value={draft.chrome.footer.contactLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, contactLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Anfahrt & Karte"
              value={draft.chrome.footer.mapsLink}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, mapsLink: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Kontaktformular"
              value={draft.chrome.footer.contactForm}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, contactForm: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Route"
              value={draft.chrome.footer.route}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, route: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Impressum"
              value={draft.chrome.footer.impressum}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, impressum: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Datenschutz"
              value={draft.chrome.footer.datenschutz}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, datenschutz: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Cookies"
              value={draft.chrome.footer.cookies}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, cookies: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Inhaber-Präfix"
              value={draft.chrome.footer.ownerPrefix}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, ownerPrefix: value },
                  },
                }))
              }
            />
            <Text
              label="Footer · Instagram-Präfix"
              value={draft.chrome.footer.instagramPrefix}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    footer: { ...p.chrome.footer, instagramPrefix: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Footer · Entdecken-Links">
            {draft.chrome.footer.exploreLinks.map((link, index) => (
              <div key={`explore-${index}`} className="admin-section-body space-y-2 border-b border-[color:var(--admin-line)] pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-medium text-[color:var(--admin-muted)]">
                  Link {index + 1}
                </p>
                <Text
                  label="Link-Text"
                  value={link.label}
                  onChange={(value) =>
                    update((p) => {
                      const exploreLinks = p.chrome.footer.exploreLinks.map(
                        (item, i) =>
                          i === index ? { ...item, label: value } : item,
                      );
                      return {
                        ...p,
                        chrome: {
                          ...p.chrome,
                          footer: { ...p.chrome.footer, exploreLinks },
                        },
                      };
                    })
                  }
                />
                <Field label="Href (Pfad)" hint="Fest durch die Navigation — nicht änderbar.">
                  <input
                    value={link.href}
                    disabled
                    readOnly
                    className={fieldClass}
                  />
                </Field>
              </div>
            ))}
          </Section>

          <Section title="Cookie-Banner">
            <Text
              label="Cookie · Titel"
              value={draft.chrome.cookie.title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, title: value },
                  },
                }))
              }
            />
            <Text
              label="Cookie · Fließtext"
              value={draft.chrome.cookie.lead}
              rows={4}
              hint="Platzhalter: {privacy} und {imprint}"
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, lead: value },
                  },
                }))
              }
            />
            <Text
              label="Cookie · Datenschutz-Linktext"
              value={draft.chrome.cookie.privacyLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, privacyLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Cookie · Impressum-Linktext"
              value={draft.chrome.cookie.imprintLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, imprintLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Cookie · Nur notwendige"
              value={draft.chrome.cookie.btnNecessary}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, btnNecessary: value },
                  },
                }))
              }
            />
            <Text
              label="Cookie · Alle akzeptieren"
              value={draft.chrome.cookie.btnAcceptAll}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    cookie: { ...p.chrome.cookie, btnAcceptAll: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Kochkurs-Promo (Popup)">
            <Text
              label="Promo · Kicker"
              value={draft.chrome.coursePromo.kicker}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    coursePromo: { ...p.chrome.coursePromo, kicker: value },
                  },
                }))
              }
            />
            <Text
              label="Promo · Nächster Termin"
              value={draft.chrome.coursePromo.nextLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    coursePromo: { ...p.chrome.coursePromo, nextLabel: value },
                  },
                }))
              }
            />
            <Text
              label="Promo · Mehr erfahren"
              value={draft.chrome.coursePromo.more}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    coursePromo: { ...p.chrome.coursePromo, more: value },
                  },
                }))
              }
            />
            <Text
              label="Promo · Schließen (Aria)"
              value={draft.chrome.coursePromo.close}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    coursePromo: { ...p.chrome.coursePromo, close: value },
                  },
                }))
              }
            />
            <Text
              label="Promo · Uhr-Suffix"
              value={draft.chrome.coursePromo.atTime}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    coursePromo: { ...p.chrome.coursePromo, atTime: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Karte (Consent)">
            <Text
              label="Karte · Kicker"
              value={draft.chrome.map.kicker}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    map: { ...p.chrome.map, kicker: value },
                  },
                }))
              }
            />
            <Text
              label="Karte · Consent-Text"
              value={draft.chrome.map.consentText}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    map: { ...p.chrome.map, consentText: value },
                  },
                }))
              }
            />
            <Text
              label="Karte · Laden-Button"
              value={draft.chrome.map.load}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    map: { ...p.chrome.map, load: value },
                  },
                }))
              }
            />
            <Text
              label="Karte · Extern öffnen"
              value={draft.chrome.map.openExternal}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    map: { ...p.chrome.map, openExternal: value },
                  },
                }))
              }
            />
          </Section>

          <Section title="Standort-Labels (überall)">
            <Text
              label="Label · Öffnungszeiten"
              value={draft.chrome.locationLabels.hours}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    locationLabels: {
                      ...p.chrome.locationLabels,
                      hours: value,
                    },
                  },
                }))
              }
            />
            <Text
              label="Label · Telefon"
              value={draft.chrome.locationLabels.phone}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    locationLabels: {
                      ...p.chrome.locationLabels,
                      phone: value,
                    },
                  },
                }))
              }
            />
            <Text
              label="CTA · Route planen"
              value={draft.chrome.locationLabels.routeCta}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    locationLabels: {
                      ...p.chrome.locationLabels,
                      routeCta: value,
                    },
                  },
                }))
              }
            />
            <Text
              label="CTA · In Google Maps"
              value={draft.chrome.locationLabels.mapsCta}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  chrome: {
                    ...p.chrome,
                    locationLabels: {
                      ...p.chrome.locationLabels,
                      mapsCta: value,
                    },
                  },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "start" ? (
        <>
          <Section title="Hero">
            <Text
              label="Hero-Titel Zeile 1"
              value={draft.home.heroTitleLine1}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, heroTitleLine1: value },
                }))
              }
            />
            <Text
              label="Hero-Titel Zeile 2"
              value={draft.home.heroTitleLine2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, heroTitleLine2: value },
                }))
              }
            />
            <Text
              label="Hero · Route-Hinweis"
              value={draft.home.routeHint}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, routeHint: value },
                }))
              }
            />
            <Text
              label="Hero · CTA Speisekarte"
              value={draft.home.ctaMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, ctaMenu: value },
                }))
              }
            />
            <Text
              label="Hero · CTA Karte"
              value={draft.home.ctaMap}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, ctaMap: value },
                }))
              }
            />
          </Section>

          <Section title="Marke">
            <Text
              label="Markenname"
              value={draft.home.brandName}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, brandName: value },
                }))
              }
            />
            <Text
              label="Marken-Tagline"
              value={draft.home.brandTagline}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, brandTagline: value },
                }))
              }
            />
          </Section>

          <Section title="Küche">
            <Text
              label="Küche · Eyebrow"
              value={draft.home.kitchenEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, kitchenEyebrow: value },
                }))
              }
            />
            <Text
              label="Küche · Überschrift"
              value={draft.home.kitchenTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, kitchenTitle: value },
                }))
              }
            />
            <Text
              label="Küche · Absatz 1"
              value={draft.home.kitchenP1}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, kitchenP1: value },
                }))
              }
            />
            <Text
              label="Küche · Absatz 2"
              value={draft.home.kitchenP2}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, kitchenP2: value },
                }))
              }
            />
            <Text
              label="Küche · CTA"
              value={draft.home.kitchenCta}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, kitchenCta: value },
                }))
              }
            />
          </Section>

          <Section title="Angebote (3 Karten)">
            <Text
              label="Angebote · CTA-Label"
              value={draft.home.offersCta}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, offersCta: value },
                }))
              }
            />
            {draft.home.offers.map((offer, index) => (
              <div
                key={`offer-${index}`}
                className="space-y-2 border-b border-[color:var(--admin-line)] pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-medium text-[color:var(--admin-muted)]">
                  Angebot {index + 1}
                </p>
                <Text
                  label="Titel"
                  value={offer.title}
                  onChange={(value) =>
                    update((p) => {
                      const offers = p.home.offers.map((item, i) =>
                        i === index ? { ...item, title: value } : item,
                      );
                      return { ...p, home: { ...p.home, offers } };
                    })
                  }
                />
                <Text
                  label="Text"
                  value={offer.text}
                  rows={2}
                  onChange={(value) =>
                    update((p) => {
                      const offers = p.home.offers.map((item, i) =>
                        i === index ? { ...item, text: value } : item,
                      );
                      return { ...p, home: { ...p.home, offers } };
                    })
                  }
                />
                <Field label="Href" hint="Fest durch die Navigation — nicht änderbar.">
                  <input
                    value={offer.href}
                    disabled
                    readOnly
                    className={fieldClass}
                  />
                </Field>
              </div>
            ))}
          </Section>

          <Section title="Mitnehmen-Band">
            <Text
              label="Mitnehmen · Eyebrow"
              value={draft.home.takeawayEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayEyebrow: value },
                }))
              }
            />
            <Text
              label="Mitnehmen · Titel Zeile 1"
              value={draft.home.takeawayTitleLine1}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayTitleLine1: value },
                }))
              }
            />
            <Text
              label="Mitnehmen · Titel Zeile 2"
              value={draft.home.takeawayTitleLine2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayTitleLine2: value },
                }))
              }
            />
            <Text
              label="Mitnehmen · Fließtext"
              value={draft.home.takeawayText}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayText: value },
                }))
              }
            />
            <Text
              label="Mitnehmen · CTA 1"
              value={draft.home.takeawayCta1}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayCta1: value },
                }))
              }
            />
            <Text
              label="Mitnehmen · CTA 2"
              value={draft.home.takeawayCta2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, takeawayCta2: value },
                }))
              }
            />
          </Section>

          <Section title="FAQ-Teaser (Startseite)">
            <Text
              label="FAQ · Eyebrow"
              value={draft.home.faqEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, faqEyebrow: value },
                }))
              }
            />
            <Text
              label="FAQ · Überschrift"
              value={draft.home.faqTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, faqTitle: value },
                }))
              }
            />
            <Text
              label="FAQ · Einleitung"
              value={draft.home.faqLead}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  home: { ...p.home, faqLead: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "speisekarte" ? (
        <>
          <Section title="Hero">
            <Text
              label="Hero · Eyebrow"
              value={draft.speisekarte.heroEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, heroEyebrow: value },
                }))
              }
            />
            <Text
              label="Hero · Titel"
              value={draft.speisekarte.heroTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, heroTitle: value },
                }))
              }
            />
            <Text
              label="Hero · Text"
              value={draft.speisekarte.heroText}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, heroText: value },
                }))
              }
            />
          </Section>

          <Section title="PDF-Bereich">
            <Text
              label="PDF · Eyebrow"
              value={draft.speisekarte.pdfEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, pdfEyebrow: value },
                }))
              }
            />
            <Text
              label="PDF · Text"
              value={draft.speisekarte.pdfText}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, pdfText: value },
                }))
              }
            />
            <Text
              label="PDF · CTA"
              value={draft.speisekarte.pdfCta}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, pdfCta: value },
                }))
              }
            />
          </Section>

          <Section title="Chips">
            <Text
              label="Chip · Beliebte Gerichte"
              value={draft.speisekarte.chipWeekly}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, chipWeekly: value },
                }))
              }
            />
            <Text
              label="Chip · Als PDF"
              value={draft.speisekarte.chipPdf}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarte: { ...p.speisekarte, chipPdf: value },
                }))
              }
            />
          </Section>

          <Section title="Speisekarte-UI (Komponente)">
            <Text
              label="UI · Woche Eyebrow"
              value={draft.speisekarteUi.weekEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarteUi: { ...p.speisekarteUi, weekEyebrow: value },
                }))
              }
            />
            <Text
              label="UI · Woche Titel"
              value={draft.speisekarteUi.weekTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarteUi: { ...p.speisekarteUi, weekTitle: value },
                }))
              }
            />
            <Text
              label="UI · Zur vollständigen Speisekarte"
              value={draft.speisekarteUi.toFullMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarteUi: { ...p.speisekarteUi, toFullMenu: value },
                }))
              }
            />
            <Text
              label="UI · Kennzeichnung Titel"
              value={draft.speisekarteUi.markingTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarteUi: { ...p.speisekarteUi, markingTitle: value },
                }))
              }
            />
            <Text
              label="UI · Kennzeichnung Text"
              value={draft.speisekarteUi.markingText}
              rows={4}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  speisekarteUi: { ...p.speisekarteUi, markingText: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "catering" ? (
        <>
          <Section title="Hero">
            <Text
              label="Hero · Eyebrow"
              value={draft.catering.heroEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, heroEyebrow: value },
                }))
              }
            />
            <Text
              label="Hero · Titel"
              value={draft.catering.heroTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, heroTitle: value },
                }))
              }
            />
            <Text
              label="Hero · Text"
              value={draft.catering.heroText}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, heroText: value },
                }))
              }
            />
          </Section>

          <Section title="Service">
            <Text
              label="Service · Eyebrow"
              value={draft.catering.serviceEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, serviceEyebrow: value },
                }))
              }
            />
            <Text
              label="Service · Überschrift"
              value={draft.catering.serviceTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, serviceTitle: value },
                }))
              }
            />
            <Text
              label="Service · Einleitung"
              value={draft.catering.serviceLead}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, serviceLead: value },
                }))
              }
            />
          </Section>

          <Section title="Leistungen">
            {draft.catering.offerings.map((item, index) => (
              <div
                key={`offering-${index}`}
                className="space-y-2 border-b border-[color:var(--admin-line)] pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-medium text-[color:var(--admin-muted)]">
                  Leistung {index + 1}
                </p>
                <Text
                  label="Titel"
                  value={item.title}
                  onChange={(value) =>
                    update((p) => {
                      const offerings = p.catering.offerings.map((entry, i) =>
                        i === index ? { ...entry, title: value } : entry,
                      );
                      return { ...p, catering: { ...p.catering, offerings } };
                    })
                  }
                />
                <Text
                  label="Text"
                  value={item.text}
                  rows={3}
                  onChange={(value) =>
                    update((p) => {
                      const offerings = p.catering.offerings.map((entry, i) =>
                        i === index ? { ...entry, text: value } : entry,
                      );
                      return { ...p, catering: { ...p.catering, offerings } };
                    })
                  }
                />
              </div>
            ))}
          </Section>

          <Section title="CTAs & Formular">
            <Text
              label="CTA · E-Mail"
              value={draft.catering.ctaEmail}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, ctaEmail: value },
                }))
              }
            />
            <Text
              label="CTA · Anrufen"
              value={draft.catering.ctaCall}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, ctaCall: value },
                }))
              }
            />
            <Text
              label="Formular-Hinweis · vor Link"
              value={draft.catering.formHintBefore}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formHintBefore: value },
                }))
              }
            />
            <Text
              label="Formular-Hinweis · Linktext"
              value={draft.catering.formHintLink}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formHintLink: value },
                }))
              }
            />
            <Text
              label="Formular-Hinweis · nach Link"
              value={draft.catering.formHintAfter}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formHintAfter: value },
                }))
              }
            />
            <Text
              label="Formular · Titel"
              value={draft.catering.formTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formTitle: value },
                }))
              }
            />
            <Text
              label="Formular · Intro"
              value={draft.catering.formIntro}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formIntro: value },
                }))
              }
            />
            <Text
              label="Formular · Betreff"
              value={draft.catering.formSubject}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  catering: { ...p.catering, formSubject: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "kochkurs" ? (
        <>
          <Section title="Eyebrows & Überschriften">
            <Text
              label="Hero · Eyebrow"
              value={draft.kochkurs.heroEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, heroEyebrow: value },
                }))
              }
            />
            <Text
              label="Mitte · Eyebrow"
              value={draft.kochkurs.midEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, midEyebrow: value },
                }))
              }
            />
            <Text
              label="Details · Eyebrow"
              value={draft.kochkurs.detailsEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, detailsEyebrow: value },
                }))
              }
            />
            <Text
              label="Details · Titel"
              value={draft.kochkurs.detailsTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, detailsTitle: value },
                }))
              }
            />
            <Text
              label="Inklusive · Titel"
              value={draft.kochkurs.includesTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, includesTitle: value },
                }))
              }
            />
            <Text
              label="Mitbringen · Titel"
              value={draft.kochkurs.bringTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, bringTitle: value },
                }))
              }
            />
            <Text
              label="Treffpunkt · Titel"
              value={draft.kochkurs.meetupTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, meetupTitle: value },
                }))
              }
            />
          </Section>

          <Section title="Ablauf">
            <Text
              label="Ablauf · Eyebrow"
              value={draft.kochkurs.flowEyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, flowEyebrow: value },
                }))
              }
            />
            <Text
              label="Ablauf · Titel"
              value={draft.kochkurs.flowTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, flowTitle: value },
                }))
              }
            />
            <Text
              label="Ablauf · Einleitung"
              value={draft.kochkurs.flowLead}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, flowLead: value },
                }))
              }
            />
            {draft.kochkurs.flowSteps.map((step, index) => (
              <div
                key={`flow-${index}`}
                className="space-y-2 border-b border-[color:var(--admin-line)] pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-medium text-[color:var(--admin-muted)]">
                  Schritt {index + 1}
                </p>
                <Text
                  label="Schritt-Label"
                  value={step.label}
                  onChange={(value) =>
                    update((p) => {
                      const flowSteps = p.kochkurs.flowSteps.map((entry, i) =>
                        i === index ? { ...entry, label: value } : entry,
                      );
                      return { ...p, kochkurs: { ...p.kochkurs, flowSteps } };
                    })
                  }
                />
                <Text
                  label="Schritt-Text"
                  value={step.value}
                  rows={3}
                  hint={
                    index === 1
                      ? "Platzhalter möglich: {dish}"
                      : undefined
                  }
                  onChange={(value) =>
                    update((p) => {
                      const flowSteps = p.kochkurs.flowSteps.map((entry, i) =>
                        i === index ? { ...entry, value: value } : entry,
                      );
                      return { ...p, kochkurs: { ...p.kochkurs, flowSteps } };
                    })
                  }
                />
              </div>
            ))}
          </Section>

          <Section title="Fakten-Labels">
            <Text
              label="Fakt · Termin"
              value={draft.kochkurs.factTermin}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factTermin: value },
                }))
              }
            />
            <Text
              label="Fakt · Beginn"
              value={draft.kochkurs.factBeginn}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factBeginn: value },
                }))
              }
            />
            <Text
              label="Fakt · Dauer"
              value={draft.kochkurs.factDauer}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factDauer: value },
                }))
              }
            />
            <Text
              label="Fakt · Preis"
              value={draft.kochkurs.factPreis}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factPreis: value },
                }))
              }
            />
            <Text
              label="Fakt · Plätze"
              value={draft.kochkurs.factPlaetze}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factPlaetze: value },
                }))
              }
            />
            <Text
              label="Fakt · Niveau"
              value={draft.kochkurs.factNiveau}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factNiveau: value },
                }))
              }
            />
            <Text
              label="Fakt · Gericht"
              value={draft.kochkurs.factGericht}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, factGericht: value },
                }))
              }
            />
          </Section>

          <Section title="CTAs & Formular">
            <Text
              label="CTA · E-Mail"
              value={draft.kochkurs.ctaEmail}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, ctaEmail: value },
                }))
              }
            />
            <Text
              label="CTA · Anrufen"
              value={draft.kochkurs.ctaCall}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, ctaCall: value },
                }))
              }
            />
            <Text
              label="Alt-Hinweis · vor Link"
              value={draft.kochkurs.formAltBefore}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formAltBefore: value },
                }))
              }
            />
            <Text
              label="Alt-Hinweis · Linktext"
              value={draft.kochkurs.formAltLink}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formAltLink: value },
                }))
              }
            />
            <Text
              label="Alt-Hinweis · nach Link"
              value={draft.kochkurs.formAltAfter}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formAltAfter: value },
                }))
              }
            />
            <Text
              label="Formular · Titel"
              value={draft.kochkurs.formTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formTitle: value },
                }))
              }
            />
            <Text
              label="Formular · Intro"
              value={draft.kochkurs.formIntro}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formIntro: value },
                }))
              }
            />
            <Text
              label="Formular · Betreff"
              value={draft.kochkurs.formSubject}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kochkurs: { ...p.kochkurs, formSubject: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "mitnehmen" ? (
        <>
          <Section title="Hero">
            <Text
              label="Eyebrow"
              value={draft.mitnehmen.eyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, eyebrow: value },
                }))
              }
            />
            <Text
              label="Titel"
              value={draft.mitnehmen.title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, title: value },
                }))
              }
            />
            <Text
              label="Einleitung"
              value={draft.mitnehmen.lead}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, lead: value },
                }))
              }
            />
          </Section>

          <Section title="Blöcke">
            <Text
              label="Block 1 · Titel"
              value={draft.mitnehmen.block1Title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block1Title: value },
                }))
              }
            />
            <Text
              label="Block 1 · Absatz 1"
              value={draft.mitnehmen.block1P1}
              rows={3}
              hint="Platzhalter: {phone}"
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block1P1: value },
                }))
              }
            />
            <Text
              label="Block 1 · Absatz 2"
              value={draft.mitnehmen.block1P2}
              rows={2}
              hint="Platzhalter: {street}, {zip}, {city}"
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block1P2: value },
                }))
              }
            />
            <Text
              label="Block 2 · Titel"
              value={draft.mitnehmen.block2Title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block2Title: value },
                }))
              }
            />
            <Text
              label="Block 2 · Text"
              value={draft.mitnehmen.block2P2}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block2P2: value },
                }))
              }
            />
            <Text
              label="Block 3 · Titel"
              value={draft.mitnehmen.block3Title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block3Title: value },
                }))
              }
            />
            <Text
              label="Block 3 · Text"
              value={draft.mitnehmen.block3P1}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, block3P1: value },
                }))
              }
            />
          </Section>

          <Section title="CTAs">
            <Text
              label="CTA · Speisekarte"
              value={draft.mitnehmen.ctaMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, ctaMenu: value },
                }))
              }
            />
            <Text
              label="CTA · Anfahrt"
              value={draft.mitnehmen.ctaAnfahrt}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  mitnehmen: { ...p.mitnehmen, ctaAnfahrt: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "ueberUns" ? (
        <>
          <Section title="Hero">
            <Text
              label="Eyebrow"
              value={draft.ueberUns.eyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, eyebrow: value },
                }))
              }
            />
            <Text
              label="Titel"
              value={draft.ueberUns.title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, title: value },
                }))
              }
            />
            <Text
              label="Einleitung"
              value={draft.ueberUns.lead}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, lead: value },
                }))
              }
            />
          </Section>

          <Section title="Abschnitte">
            <Text
              label="Bedeutung · Titel"
              value={draft.ueberUns.meaningTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, meaningTitle: value },
                }))
              }
            />
            <Text
              label="Ort · Titel"
              value={draft.ueberUns.placeTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, placeTitle: value },
                }))
              }
            />
            <Text
              label="Ort · Absatz 1"
              value={draft.ueberUns.placeP1}
              rows={3}
              hint="Platzhalter: {fullName}, {street}"
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, placeP1: value },
                }))
              }
            />
            <Text
              label="Ort · Inhaber-Präfix"
              value={draft.ueberUns.placeP2Prefix}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, placeP2Prefix: value },
                }))
              }
            />
            <Text
              label="Öffnungszeiten · Titel"
              value={draft.ueberUns.hoursTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, hoursTitle: value },
                }))
              }
            />
            <Text
              label="Öffnungszeiten · Text"
              value={draft.ueberUns.hoursP2}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, hoursP2: value },
                }))
              }
            />
          </Section>

          <Section title="CTAs">
            <Text
              label="CTA · Speisekarte"
              value={draft.ueberUns.ctaMenu}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, ctaMenu: value },
                }))
              }
            />
            <Text
              label="CTA · Kontakt"
              value={draft.ueberUns.ctaKontakt}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  ueberUns: { ...p.ueberUns, ctaKontakt: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "anfahrt" ? (
        <>
          <Section title="Hero">
            <Text
              label="Eyebrow"
              value={draft.anfahrt.eyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, eyebrow: value },
                }))
              }
            />
            <Text
              label="Titel"
              value={draft.anfahrt.title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, title: value },
                }))
              }
            />
            <Text
              label="Einleitung"
              value={draft.anfahrt.lead}
              rows={2}
              hint="Platzhalter: {street}, {zip}, {city}"
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, lead: value },
                }))
              }
            />
          </Section>

          <Section title="Abschnitte">
            <Text
              label="Adresse · Titel"
              value={draft.anfahrt.addressTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, addressTitle: value },
                }))
              }
            />
            <Text
              label="Telefon-Label"
              value={draft.anfahrt.phoneLabel}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, phoneLabel: value },
                }))
              }
            />
            <Text
              label="Öffnungszeiten · Titel"
              value={draft.anfahrt.hoursTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, hoursTitle: value },
                }))
              }
            />
            <Text
              label="Anreise · Titel"
              value={draft.anfahrt.travelTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, travelTitle: value },
                }))
              }
            />
            <Text
              label="Anreise · Text"
              value={draft.anfahrt.travelText}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, travelText: value },
                }))
              }
            />
          </Section>

          <Section title="CTAs">
            <Text
              label="CTA · Route"
              value={draft.anfahrt.ctaRoute}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, ctaRoute: value },
                }))
              }
            />
            <Text
              label="CTA · Anrufen"
              value={draft.anfahrt.ctaCall}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, ctaCall: value },
                }))
              }
            />
            <Text
              label="CTA · Kontakt"
              value={draft.anfahrt.ctaKontakt}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  anfahrt: { ...p.anfahrt, ctaKontakt: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "kontakt" ? (
        <>
          <Section title="Hero">
            <Text
              label="Eyebrow"
              value={draft.kontakt.eyebrow}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, eyebrow: value },
                }))
              }
            />
            <Text
              label="Titel"
              value={draft.kontakt.title}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, title: value },
                }))
              }
            />
            <Text
              label="Einleitung"
              value={draft.kontakt.lead}
              rows={3}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, lead: value },
                }))
              }
            />
          </Section>

          <Section title="Kontakt-Labels">
            <Text
              label="Label · Telefon"
              value={draft.kontakt.labelPhone}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, labelPhone: value },
                }))
              }
            />
            <Text
              label="Label · E-Mail"
              value={draft.kontakt.labelEmail}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, labelEmail: value },
                }))
              }
            />
            <Text
              label="Label · Adresse"
              value={draft.kontakt.labelAddress}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, labelAddress: value },
                }))
              }
            />
            <Text
              label="Label · Öffnungszeiten"
              value={draft.kontakt.labelHours}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, labelHours: value },
                }))
              }
            />
            <Text
              label="Maps-Linktext"
              value={draft.kontakt.mapsLink}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, mapsLink: value },
                }))
              }
            />
          </Section>

          <Section title="Formular auf /kontakt">
            <Text
              label="Formular · Titel"
              value={draft.kontakt.formTitle}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, formTitle: value },
                }))
              }
            />
            <Text
              label="Formular · Intro"
              value={draft.kontakt.formIntro}
              rows={2}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, formIntro: value },
                }))
              }
            />
            <Text
              label="Formular · Betreff"
              value={draft.kontakt.formSubject}
              onChange={(value) =>
                update((p) => ({
                  ...p,
                  kontakt: { ...p.kontakt, formSubject: value },
                }))
              }
            />
          </Section>
        </>
      ) : null}

      {tab === "faq" ? (
        <Section
          title="Häufige Fragen"
          action={
            <button
              type="button"
              className="btn-gold !px-3 !py-1.5 text-sm"
              disabled={draft.faqs.length >= MAX_FAQS}
              onClick={() =>
                update((p) => {
                  if (p.faqs.length >= MAX_FAQS) return p;
                  return {
                    ...p,
                    faqs: [
                      ...p.faqs,
                      { question: "", answer: "" },
                    ],
                  };
                })
              }
            >
              Frage hinzufügen
            </button>
          }
        >
          <p className="mb-2 text-sm text-[color:var(--admin-muted)]">
            Maximal {MAX_FAQS} Einträge. Wird auf der Startseite und ggf. in
            FAQ-Bereichen genutzt.
          </p>
          {draft.faqs.length === 0 ? (
            <p className="text-sm text-[color:var(--admin-muted)]">
              Noch keine FAQ-Einträge.
            </p>
          ) : null}
          {draft.faqs.map((item, index) => (
            <div
              key={`faq-${index}`}
              className="space-y-2 border-b border-[color:var(--admin-line)] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[color:var(--admin-muted)]">
                  Frage {index + 1}
                </p>
                <button
                  type="button"
                  className="btn-ghost admin-danger-btn !px-2.5 !py-1 text-xs"
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      faqs: p.faqs.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Entfernen
                </button>
              </div>
              <Text
                label="Frage"
                value={item.question}
                onChange={(value) =>
                  update((p) => {
                    const faqs = p.faqs.map((entry, i) =>
                      i === index ? { ...entry, question: value } : entry,
                    );
                    return { ...p, faqs };
                  })
                }
              />
              <Text
                label="Antwort"
                value={item.answer}
                rows={3}
                onChange={(value) =>
                  update((p) => {
                    const faqs = p.faqs.map((entry, i) =>
                      i === index ? { ...entry, answer: value } : entry,
                    );
                    return { ...p, faqs };
                  })
                }
              />
            </div>
          ))}
        </Section>
      ) : null}

      {tab === "formular" ? (
        <Section title="Kontaktformular (geteilt)">
          <Text
            label="Standard · Titel"
            value={draft.contactForm.defaultTitle}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, defaultTitle: value },
              }))
            }
          />
          <Text
            label="Standard · Intro"
            value={draft.contactForm.defaultIntro}
            rows={2}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, defaultIntro: value },
              }))
            }
          />
          <Text
            label="Feld · Name"
            value={draft.contactForm.nameLabel}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, nameLabel: value },
              }))
            }
          />
          <Text
            label="Feld · E-Mail"
            value={draft.contactForm.emailLabel}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, emailLabel: value },
              }))
            }
          />
          <Text
            label="Feld · Telefon"
            value={draft.contactForm.phoneLabel}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, phoneLabel: value },
              }))
            }
          />
          <Text
            label="Feld · Nachricht"
            value={draft.contactForm.messageLabel}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, messageLabel: value },
              }))
            }
          />
          <Text
            label="Button · Senden"
            value={draft.contactForm.submit}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, submit: value },
              }))
            }
          />
          <Text
            label="Status · Wird gesendet"
            value={draft.contactForm.sending}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, sending: value },
              }))
            }
          />
          <Text
            label="Status · Erfolgreich"
            value={draft.contactForm.sent}
            rows={2}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, sent: value },
              }))
            }
          />
          <Text
            label="Fehler · Senden"
            value={draft.contactForm.errorSend}
            rows={2}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, errorSend: value },
              }))
            }
          />
          <Text
            label="Fehler · Netzwerk"
            value={draft.contactForm.errorNetwork}
            rows={2}
            onChange={(value) =>
              update((p) => ({
                ...p,
                contactForm: { ...p.contactForm, errorNetwork: value },
              }))
            }
          />
        </Section>
      ) : null}

      <StickySave
        saving={saving}
        phase={publishPhase}
        label="Alle Texte veröffentlichen"
        hint="Sofort live."
      />
    </form>
  );
}
