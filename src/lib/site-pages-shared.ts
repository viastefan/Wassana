/** Client-safe marketing / chrome page strings (no Node/fs). */

import { sanitizeText } from "@/lib/security";

export type FaqItem = { question: string; answer: string };

export type LinkLabel = { href: string; label: string };

export type SitePages = {
  chrome: {
    skipLink: string;
    nav: {
      start: string;
      speisekarte: string;
      catering: string;
      kochkurs: string;
      kontakt: string;
    };
    contactMenu: {
      inquiry: string;
      inquiryHint: string;
      email: string;
      call: string;
      openMenu: string;
      closeMenu: string;
    };
    footer: {
      exploreLabel: string;
      hoursLabel: string;
      contactLabel: string;
      mapsLink: string;
      contactForm: string;
      route: string;
      impressum: string;
      datenschutz: string;
      cookies: string;
      ownerPrefix: string;
      instagramPrefix: string;
      exploreLinks: { href: string; label: string }[];
    };
    cookie: {
      title: string;
      lead: string;
      privacyLabel: string;
      imprintLabel: string;
      btnNecessary: string;
      btnAcceptAll: string;
    };
    coursePromo: {
      kicker: string;
      nextLabel: string;
      more: string;
      close: string;
      atTime: string;
    };
    map: {
      kicker: string;
      consentText: string;
      load: string;
      openExternal: string;
    };
    locationLabels: {
      hours: string;
      phone: string;
      routeCta: string;
      mapsCta: string;
    };
  };
  home: {
    heroTitleLine1: string;
    heroTitleLine2: string;
    routeHint: string;
    ctaMenu: string;
    ctaMap: string;
    brandName: string;
    brandTagline: string;
    kitchenEyebrow: string;
    kitchenTitle: string;
    kitchenP1: string;
    kitchenP2: string;
    kitchenCta: string;
    offersCta: string;
    offers: { title: string; text: string; href: string }[];
    takeawayEyebrow: string;
    takeawayTitleLine1: string;
    takeawayTitleLine2: string;
    takeawayText: string;
    takeawayCta1: string;
    takeawayCta2: string;
    faqEyebrow: string;
    faqTitle: string;
    faqLead: string;
  };
  speisekarte: {
    heroEyebrow: string;
    heroTitle: string;
    heroText: string;
    pdfEyebrow: string;
    pdfText: string;
    pdfCta: string;
    weeklyEyebrow: string;
    weeklyTitle: string;
    fullMenuCta: string;
    chipWeekly: string;
    chipPdf: string;
  };
  catering: {
    heroEyebrow: string;
    heroTitle: string;
    heroText: string;
    serviceEyebrow: string;
    serviceTitle: string;
    serviceLead: string;
    offerings: { title: string; text: string }[];
    ctaEmail: string;
    ctaCall: string;
    formHintBefore: string;
    formHintLink: string;
    formHintAfter: string;
    formTitle: string;
    formIntro: string;
    formSubject: string;
  };
  kochkurs: {
    heroEyebrow: string;
    midEyebrow: string;
    detailsEyebrow: string;
    detailsTitle: string;
    includesTitle: string;
    bringTitle: string;
    meetupTitle: string;
    flowEyebrow: string;
    flowTitle: string;
    flowLead: string;
    flowSteps: { label: string; value: string }[];
    ctaEmail: string;
    ctaCall: string;
    formAltBefore: string;
    formAltLink: string;
    formAltAfter: string;
    formTitle: string;
    formIntro: string;
    formSubject: string;
    factTermin: string;
    factBeginn: string;
    factDauer: string;
    factPreis: string;
    factPlaetze: string;
    factNiveau: string;
    factGericht: string;
  };
  mitnehmen: {
    eyebrow: string;
    title: string;
    lead: string;
    block1Title: string;
    block1P1: string;
    block1P2: string;
    block2Title: string;
    block2P2: string;
    block3Title: string;
    block3P1: string;
    ctaMenu: string;
    ctaAnfahrt: string;
  };
  ueberUns: {
    eyebrow: string;
    title: string;
    lead: string;
    meaningTitle: string;
    placeTitle: string;
    placeP1: string;
    placeP2Prefix: string;
    hoursTitle: string;
    hoursP2: string;
    ctaMenu: string;
    ctaKontakt: string;
  };
  anfahrt: {
    eyebrow: string;
    title: string;
    lead: string;
    addressTitle: string;
    phoneLabel: string;
    hoursTitle: string;
    travelTitle: string;
    travelText: string;
    ctaRoute: string;
    ctaCall: string;
    ctaKontakt: string;
  };
  kontakt: {
    eyebrow: string;
    title: string;
    lead: string;
    labelPhone: string;
    labelEmail: string;
    labelAddress: string;
    labelHours: string;
    mapsLink: string;
    formTitle: string;
    formIntro: string;
    formSubject: string;
  };
  faqs: FaqItem[];
  contactForm: {
    defaultTitle: string;
    defaultIntro: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    messageLabel: string;
    submit: string;
    sending: string;
    sent: string;
    errorSend: string;
    errorNetwork: string;
  };
  speisekarteUi: {
    weekEyebrow: string;
    weekTitle: string;
    toFullMenu: string;
    markingTitle: string;
    markingText: string;
  };
  updatedAt?: string;
};

const SHORT = 80;
const LABEL = 120;
const TITLE = 160;
const LEAD = 400;
const PARA = 1200;
const FAQ_Q = 240;
const FAQ_A = 800;

/** Replace `{key}` placeholders in `text` with values from `vars`. */
export function fillTemplate(
  text: string,
  vars: Record<string, string>,
): string {
  return String(text || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return vars[key] ?? "";
    }
    return match;
  });
}

export function defaultSitePages(): SitePages {
  return {
    chrome: {
      skipLink: "Zum Inhalt springen",
      nav: {
        start: "Start",
        speisekarte: "Speisekarte",
        catering: "Catering",
        kochkurs: "Kochkurs",
        kontakt: "Kontakt",
      },
      contactMenu: {
        inquiry: "Kontaktanfrage",
        inquiryHint: "Formular schreiben",
        email: "E-Mail",
        call: "Anrufen",
        openMenu: "Menü öffnen",
        closeMenu: "Menü schließen",
      },
      footer: {
        exploreLabel: "Entdecken",
        hoursLabel: "Öffnungszeiten",
        contactLabel: "Kontakt",
        mapsLink: "Anfahrt & Karte",
        contactForm: "Kontaktformular",
        route: "Route",
        impressum: "Impressum",
        datenschutz: "Datenschutz",
        cookies: "Cookies",
        ownerPrefix: "Inh.:",
        instagramPrefix: "Instagram",
        exploreLinks: [
          { href: "/speisekarte", label: "Speisekarte" },
          { href: "/mitnehmen", label: "Mitnehmen" },
          { href: "/catering", label: "Catering" },
          { href: "/kochkurs", label: "Kochkurs" },
          { href: "/ueber-uns", label: "Über uns" },
          { href: "/anfahrt", label: "Anfahrt" },
          { href: "/kontakt", label: "Kontakt" },
        ],
      },
      cookie: {
        title: "Cookies & Datenschutz",
        lead:
          "Keine Tracking- oder Werbe-Cookies. Lokal speichern wir nur Ihre Auswahl und wenige Komfort-Einstellungen. Google Maps laden wir erst nach Zustimmung. Später ändern unter „Cookies“ im Footer. Mehr in der {privacy} und im {imprint}.",
        privacyLabel: "Datenschutzerklärung",
        imprintLabel: "Impressum",
        btnNecessary: "Nur notwendige",
        btnAcceptAll: "Alle akzeptieren",
      },
      coursePromo: {
        kicker: "Kochkurs",
        nextLabel: "Nächster Termin",
        more: "Mehr erfahren",
        close: "Hinweis schließen",
        atTime: "Uhr",
      },
      map: {
        kicker: "Karte",
        consentText:
          "Google Maps wird erst nach Zustimmung geladen (Datenschutz).",
        load: "Karte laden",
        openExternal: "In Google Maps öffnen",
      },
      locationLabels: {
        hours: "Öffnungszeiten",
        phone: "Telefon",
        routeCta: "Route planen",
        mapsCta: "In Google Maps",
      },
    },
    home: {
      heroTitleLine1: "Willkommen",
      heroTitleLine2: "bei Wassana",
      routeHint: "· Route öffnen",
      ctaMenu: "Speisekarte",
      ctaMap: "Auf der Karte",
      brandName: "Wassana",
      brandTagline: "Glück und gutes Schicksal",
      kitchenEyebrow: "Die Küche bei Wassana",
      kitchenTitle: "Salzig, süß, sauer, scharf",
      kitchenP1:
        "Authentische Gerichte wie Massaman oder Panaeng Curries, verschiedene Wok-Gerichte und das berühmte Pad kra pao finden Sie bei uns auf der Karte.",
      kitchenP2:
        "An bestimmten Tagen bieten wir auch besondere thailändische Gerichte an, die man sonst selten findet. Alle Speisen können gerne mitgenommen werden.",
      kitchenCta: "Zur Speisekarte",
      offersCta: "Entdecken",
      offers: [
        {
          title: "Speisekarte",
          text: "Beliebte Gerichte der Woche und Klassiker — frisch bei Wassana.",
          href: "/speisekarte",
        },
        {
          title: "Catering",
          text: "Events inkl. Geschirr — Menüplan von Wassana.",
          href: "/catering",
        },
        {
          title: "Kochkurs",
          text: "Schritt für Schritt Thai kochen mit Wassana.",
          href: "/kochkurs",
        },
      ],
      takeawayEyebrow: "Mo–Fr · Regierungsplatz",
      takeawayTitleLine1: "Frisch kochen.",
      takeawayTitleLine2: "Abholen. Mitnehmen.",
      takeawayText:
        "Bei Wassana kommt alles frisch aus der Küche — ideal für die Mittagspause in Landshut oder zum Mitnehmen nach Hause.",
      takeawayCta1: "Mitnehmen & Abholen",
      takeawayCta2: "Speisekarte",
      faqEyebrow: "Landshut · FAQ",
      faqTitle: "Häufige Fragen",
      faqLead: "Kurz und klar — für Gäste, die Wassana in Landshut suchen.",
    },
    speisekarte: {
      heroEyebrow: "Speisekarte Landshut",
      heroTitle: "Unsere Gerichte",
      heroText:
        "Frisch zubereitet in Landshut — Currys, Wok, Suppen und mehr. Gerne auch zum Mitnehmen.",
      pdfEyebrow: "Zum Mitnehmen & Teilen",
      pdfText:
        "Die komplette Speisekarte als klares PDF — beliebte Gerichte der Woche und alle Klassiker.",
      pdfCta: "Speisekarte als PDF",
      weeklyEyebrow: "Diese Woche bei Wassana",
      weeklyTitle: "Beliebte Gerichte der Woche",
      fullMenuCta: "Zur vollständigen Speisekarte",
      chipWeekly: "Beliebte Gerichte",
      chipPdf: "Als PDF",
    },
    catering: {
      heroEyebrow: "Catering Landshut",
      heroTitle: "Feierlichkeiten mit Thai-Atmosphäre",
      heroText:
        "Geburtstage, Firmenfeiern oder Hochzeiten — individueller Menüplan und passendes Geschirr.",
      serviceEyebrow: "Unser Service",
      serviceTitle: "Was wir übernehmen",
      serviceLead:
        "Du sagst uns Anlass, Personenzahl und Termin — wir kümmern uns um Menü, Mengen und die praktische Umsetzung.",
      offerings: [
        {
          title: "Individueller Menüplan",
          text: "Wir stellen Curries, Wok-Gerichte und Beilagen passend zu Anlass, Gästezahl und Vorlieben zusammen — auch vegetarisch möglich.",
        },
        {
          title: "Frisch zubereitet",
          text: "Die Gerichte kommen frisch aus unserer Küche am Regierungsplatz — authentisch gewürzt, zum Buffet oder zum Portionieren.",
        },
        {
          title: "Passendes Geschirr",
          text: "Auf Wunsch liefern wir Geschirr und Servierbedarf mit, damit bei dir vor Ort weniger Organisation nötig ist.",
        },
        {
          title: "Geburtstage & private Feiern",
          text: "Vom kleinen Familienessen bis zur größeren Feier — wir stimmen Menge und Menü vorher klar mit dir ab.",
        },
        {
          title: "Firmenfeiern & Meetings",
          text: "Für Teams und Kundentermine in Landshut: zuverlässig, zeitlich planbar und mit klarer Absprache zu Lieferung oder Abholung.",
        },
        {
          title: "Hochzeiten & besondere Anlässe",
          text: "Thai-Küche als besonderer Akzent — wir planen Vorlauf, Mengen und Ablauf gemeinsam mit euch.",
        },
      ],
      ctaEmail: "Per E-Mail anfragen",
      ctaCall: "Anrufen",
      formHintBefore: "Oder nutze das Formular hier — oder unser ",
      formHintLink: "Kontaktformular",
      formHintAfter: ".",
      formTitle: "Catering anfragen",
      formIntro: "Kurz Anlass, Personenzahl und Wunschtermin — wir melden uns.",
      formSubject: "Catering Anfrage Landshut",
    },
    kochkurs: {
      heroEyebrow: "Kochkurs Landshut",
      midEyebrow: "Bei Wassana",
      detailsEyebrow: "Gut zu wissen",
      detailsTitle: "Was dich erwartet",
      includesTitle: "Inklusive",
      bringTitle: "Bitte mitbringen",
      meetupTitle: "Treffpunkt",
      flowEyebrow: "So läuft es",
      flowTitle: "Vom ersten Schnitt bis zum Teller",
      flowLead:
        "Ein Abend bei Wassana in Landshut — gemeinsam kochen, lernen und genießen. Zutaten und Anleitung sind dabei.",
      flowSteps: [
        {
          label: "Ankommen",
          value:
            "Wir begrüßen euch in der Küche, stellen den Ablauf vor und gehen die Zutaten gemeinsam durch.",
        },
        {
          label: "Kochen",
          value:
            "Schritt für Schritt bereitet ihr {dish} zu — mit Tipps zur Schärfe und Würzung.",
        },
        {
          label: "Genießen & mitnehmen",
          value:
            "Am Ende probiert ihr euer Gericht und bekommt Tipps, wo ihr die Zutaten später selbst findet.",
        },
      ],
      ctaEmail: "Per E-Mail anfragen",
      ctaCall: "Anrufen",
      formAltBefore: "Auch über das ",
      formAltLink: "Kontaktformular",
      formAltAfter: " möglich.",
      formTitle: "Kursplatz anfragen",
      formIntro: "Name, Personenanzahl und Wunschtermin reichen völlig.",
      formSubject: "Kochkurs Anfrage Landshut",
      factTermin: "Termin",
      factBeginn: "Beginn",
      factDauer: "Dauer",
      factPreis: "Preis",
      factPlaetze: "Plätze",
      factNiveau: "Niveau",
      factGericht: "Gericht",
    },
    mitnehmen: {
      eyebrow: "Abholen in Landshut",
      title: "Frisch mitnehmen",
      lead:
        "Curries, Wok und Klassiker — frisch aus der Küche, ideal für Büro, Pause oder zu Hause.",
      block1Title: "So funktioniert Abholen",
      block1P1:
        "Ihr bestellt telefonisch unter {phone} oder kommt vorbei. Wir kochen frisch und packen euer Essen zum Mitnehmen ein.",
      block1P2:
        "Adresse: {street}, {zip} {city} — zentral am Regierungsplatz.",
      block2Title: "Wann abholen?",
      block2P2:
        "Besonders zur Mittagszeit lohnt sich ein Blick auf die aktuellen beliebten Gerichte der Woche — viele eignen sich gut zum Mitnehmen.",
      block3Title: "Was eignet sich zum Mitnehmen?",
      block3P1:
        "Curries mit Duftreis, Wok-Gerichte, Suppen und die beliebten Gerichte der Woche lassen sich gut transportieren. Schärfe könnt ihr nach Wunsch wählen.",
      ctaMenu: "Speisekarte ansehen",
      ctaAnfahrt: "Anfahrt",
    },
    ueberUns: {
      eyebrow: "Wassana Landshut",
      title: "Über uns",
      lead:
        "Frisch gekocht am Regierungsplatz — mit dem Wunsch nach Glück und gutem Schicksal.",
      meaningTitle: "Was Wassana bedeutet",
      placeTitle: "Thai Imbiss am Regierungsplatz",
      placeP1:
        "{fullName} ist euer Thai Imbiss in Landshut — zentral am {street}. Bei uns gibt es Curries, Wok-Gerichte und Klassiker der thailändischen Küche, frisch zubereitet und gerne zum Mitnehmen.",
      placeP2Prefix: "Inhaber:",
      hoursTitle: "Wann wir für euch da sind",
      hoursP2:
        "Ideal für die Mittagspause, zum Abholen nach der Arbeit oder für ein authentisches Thai-Gericht zwischendurch.",
      ctaMenu: "Speisekarte",
      ctaKontakt: "Kontakt",
    },
    anfahrt: {
      eyebrow: "Standort Landshut",
      title: "So findet ihr uns",
      lead: "{street}, {zip} {city} — im Gewerbehaus am Regierungsplatz.",
      addressTitle: "Adresse",
      phoneLabel: "Telefon:",
      hoursTitle: "Öffnungszeiten",
      travelTitle: "Mit dem Auto oder zu Fuß",
      travelText:
        "Der Regierungsplatz liegt zentral in Landshut. Zu Fuß aus der Altstadt gut erreichbar; mit dem Auto über die üblichen Zufahrten zur Innenstadt. Für die genaue Route nutzt am besten Google Maps.",
      ctaRoute: "Route öffnen",
      ctaCall: "Anrufen",
      ctaKontakt: "Kontakt",
    },
    kontakt: {
      eyebrow: "Kontakt Landshut",
      title: "Schreib uns oder ruf an",
      lead:
        "Für Bestellungen, Catering oder den Kochkurs sind wir gerne für dich da — mitten in Landshut.",
      labelPhone: "Telefon",
      labelEmail: "E-Mail",
      labelAddress: "Adresse",
      labelHours: "Öffnungszeiten",
      mapsLink: "In Google Maps öffnen",
      formTitle: "Nachricht senden",
      formIntro: "Schreib uns kurz dein Anliegen — wir melden uns zurück.",
      formSubject: "Anfrage über die Website",
    },
    faqs: [
      {
        question: "Wo liegt Wassana Thai Imbiss in Landshut?",
        answer:
          "Wassana befindet sich am Regierungsplatz 542, 84028 Landshut — zentral in der Altstadt, gut erreichbar zu Fuß und mit dem Auto.",
      },
      {
        question: "Wann hat Wassana in Landshut geöffnet?",
        answer:
          "Montag bis Freitag von 11:00 bis 18:00 Uhr. Samstag, Sonntag und an Feiertagen sind wir geschlossen.",
      },
      {
        question: "Kann ich bei Wassana Thai-Essen mitnehmen?",
        answer:
          "Ja. Alle Gerichte gibt es frisch zubereitet zum Mitnehmen — ideal für Mittagspause, Büro oder zu Hause in Landshut.",
      },
      {
        question: "Gibt es beliebte Gerichte der Woche und Schüler-Mittagessen?",
        answer:
          "Ja. Mo–Fr gibt es wechselnde beliebte Gerichte der Woche. Für Schülerinnen, Schüler und Azubis gibt es mittags ein Angebot inkl. Softgetränk — gegen Vorlage eines Ausweises. Details stehen im Angebot oben auf der Seite.",
      },
      {
        question: "Bietet Wassana Catering und Kochkurse in Landshut an?",
        answer:
          "Ja. Wir bieten Catering für Events und Thai-Kochkurse in Landshut an. Anfragen am besten über das Kontaktformular oder telefonisch unter 0871/9745862.",
      },
    ],
    contactForm: {
      defaultTitle: "Nachricht senden",
      defaultIntro: "Schreib uns kurz dein Anliegen — wir melden uns zurück.",
      nameLabel: "Name",
      emailLabel: "E-Mail",
      phoneLabel: "Telefon (optional)",
      messageLabel: "Nachricht",
      submit: "Anfrage senden",
      sending: "Wird gesendet …",
      sent: "Danke — deine Anfrage ist angekommen. Wir melden uns so bald wie möglich.",
      errorSend: "Senden fehlgeschlagen. Bitte später erneut versuchen.",
      errorNetwork:
        "Netzwerkfehler. Bitte später erneut versuchen oder anrufen.",
    },
    speisekarteUi: {
      weekEyebrow: "Diese Woche bei Wassana",
      weekTitle: "Beliebte Gerichte der Woche",
      toFullMenu: "Zur vollständigen Speisekarte",
      markingTitle: "Hinweise & Kennzeichnung",
      markingText:
        "Hochgestellte Zeichen neben den Gerichten stehen für Zusatzstoffe und Allergene. Schärfe nach Wunsch: nicht scharf – leicht scharf – mittelscharf – scharf – sehr scharf. Extra Soße 0,10 €. Getränke mit * inkl. 0,15 € Pfand.",
    },
  };
}

function t(
  value: unknown,
  fallback: string,
  max: number,
): string {
  // Explicit empty string from Admin must survive (missing/null → fallback).
  if (value === undefined || value === null) return fallback;
  return sanitizeText(String(value), max);
}

function mergeHrefLinks(
  raw: unknown,
  fallback: { href: string; label: string }[],
  labelMax: number,
): { href: string; label: string }[] {
  const list = Array.isArray(raw) ? raw : [];
  return fallback.map((item, index) => {
    const candidate = list.find(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        "href" in entry &&
        String((entry as { href?: unknown }).href) === item.href,
    ) as { href?: unknown; label?: unknown } | undefined;
    const byIndex = list[index] as
      | { href?: unknown; label?: unknown }
      | undefined;
    const source = candidate ?? byIndex;
    return {
      href: item.href,
      label: t(source?.label, item.label, labelMax),
    };
  });
}

function mergeOffers(
  raw: unknown,
  fallback: { title: string; text: string; href: string }[],
): { title: string; text: string; href: string }[] {
  const list = Array.isArray(raw) ? raw : [];
  return fallback.map((item, index) => {
    const candidate = list.find(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        "href" in entry &&
        String((entry as { href?: unknown }).href) === item.href,
    ) as { title?: unknown; text?: unknown; href?: unknown } | undefined;
    const byIndex = list[index] as
      | { title?: unknown; text?: unknown; href?: unknown }
      | undefined;
    const source = candidate ?? byIndex;
    return {
      href: item.href,
      title: t(source?.title, item.title, TITLE),
      text: t(source?.text, item.text, LEAD),
    };
  });
}

function mergeTitleTextPairs(
  raw: unknown,
  fallback: { title: string; text: string }[],
  count: number,
): { title: string; text: string }[] {
  const list = Array.isArray(raw) ? raw : [];
  return fallback.slice(0, count).map((item, index) => {
    const source = list[index] as
      | { title?: unknown; text?: unknown }
      | undefined;
    return {
      title: t(source?.title, item.title, TITLE),
      text: t(source?.text, item.text, PARA),
    };
  });
}

function mergeFlowSteps(
  raw: unknown,
  fallback: { label: string; value: string }[],
): { label: string; value: string }[] {
  const list = Array.isArray(raw) ? raw : [];
  return fallback.map((item, index) => {
    const source = list[index] as
      | { label?: unknown; value?: unknown }
      | undefined;
    return {
      label: t(source?.label, item.label, LABEL),
      value: t(source?.value, item.value, PARA),
    };
  });
}

function mergeFaqs(raw: unknown, fallback: FaqItem[]): FaqItem[] {
  // Missing / non-array → defaults. Explicit [] stays empty.
  if (raw === undefined || raw === null) {
    return fallback.map((item) => ({ ...item }));
  }
  if (!Array.isArray(raw)) {
    return fallback.map((item) => ({ ...item }));
  }
  return raw
    .map((entry) => {
      const item = entry as { question?: unknown; answer?: unknown };
      return {
        question: sanitizeText(String(item?.question ?? ""), FAQ_Q),
        answer: sanitizeText(String(item?.answer ?? ""), FAQ_A),
      };
    })
    .filter((item) => item.question.trim() || item.answer.trim())
    .slice(0, 12);
}

/** Deep-merge partial CMS payload onto defaults with sanitized strings. */
export function normalizeSitePages(
  raw: Partial<SitePages> | null | undefined,
): SitePages {
  const base = defaultSitePages();
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<SitePages>;
  const chrome = (r.chrome ?? {}) as Partial<SitePages["chrome"]>;
  const footer = (chrome.footer ?? {}) as Partial<SitePages["chrome"]["footer"]>;
  const home = (r.home ?? {}) as Partial<SitePages["home"]>;
  const speisekarte = (r.speisekarte ?? {}) as Partial<SitePages["speisekarte"]>;
  const catering = (r.catering ?? {}) as Partial<SitePages["catering"]>;
  const kochkurs = (r.kochkurs ?? {}) as Partial<SitePages["kochkurs"]>;
  const mitnehmen = (r.mitnehmen ?? {}) as Partial<SitePages["mitnehmen"]>;
  const ueberUns = (r.ueberUns ?? {}) as Partial<SitePages["ueberUns"]>;
  const anfahrt = (r.anfahrt ?? {}) as Partial<SitePages["anfahrt"]>;
  const kontakt = (r.kontakt ?? {}) as Partial<SitePages["kontakt"]>;
  const contactForm = (r.contactForm ?? {}) as Partial<SitePages["contactForm"]>;
  const speisekarteUi = (r.speisekarteUi ?? {}) as Partial<
    SitePages["speisekarteUi"]
  >;

  return {
    chrome: {
      skipLink: t(chrome.skipLink, base.chrome.skipLink, LABEL),
      nav: {
        start: t(chrome.nav?.start, base.chrome.nav.start, SHORT),
        speisekarte: t(
          chrome.nav?.speisekarte,
          base.chrome.nav.speisekarte,
          SHORT,
        ),
        catering: t(chrome.nav?.catering, base.chrome.nav.catering, SHORT),
        kochkurs: t(chrome.nav?.kochkurs, base.chrome.nav.kochkurs, SHORT),
        kontakt: t(chrome.nav?.kontakt, base.chrome.nav.kontakt, SHORT),
      },
      contactMenu: {
        inquiry: t(
          chrome.contactMenu?.inquiry,
          base.chrome.contactMenu.inquiry,
          LABEL,
        ),
        inquiryHint: t(
          chrome.contactMenu?.inquiryHint,
          base.chrome.contactMenu.inquiryHint,
          LABEL,
        ),
        email: t(
          chrome.contactMenu?.email,
          base.chrome.contactMenu.email,
          SHORT,
        ),
        call: t(chrome.contactMenu?.call, base.chrome.contactMenu.call, SHORT),
        openMenu: t(
          chrome.contactMenu?.openMenu,
          base.chrome.contactMenu.openMenu,
          LABEL,
        ),
        closeMenu: t(
          chrome.contactMenu?.closeMenu,
          base.chrome.contactMenu.closeMenu,
          LABEL,
        ),
      },
      footer: {
        exploreLabel: t(
          footer.exploreLabel,
          base.chrome.footer.exploreLabel,
          LABEL,
        ),
        hoursLabel: t(footer.hoursLabel, base.chrome.footer.hoursLabel, LABEL),
        contactLabel: t(
          footer.contactLabel,
          base.chrome.footer.contactLabel,
          LABEL,
        ),
        mapsLink: t(footer.mapsLink, base.chrome.footer.mapsLink, LABEL),
        contactForm: t(
          footer.contactForm,
          base.chrome.footer.contactForm,
          LABEL,
        ),
        route: t(footer.route, base.chrome.footer.route, SHORT),
        impressum: t(footer.impressum, base.chrome.footer.impressum, SHORT),
        datenschutz: t(
          footer.datenschutz,
          base.chrome.footer.datenschutz,
          SHORT,
        ),
        cookies: t(footer.cookies, base.chrome.footer.cookies, SHORT),
        ownerPrefix: t(
          footer.ownerPrefix,
          base.chrome.footer.ownerPrefix,
          SHORT,
        ),
        instagramPrefix: t(
          footer.instagramPrefix,
          base.chrome.footer.instagramPrefix,
          SHORT,
        ),
        exploreLinks: mergeHrefLinks(
          footer.exploreLinks,
          base.chrome.footer.exploreLinks,
          LABEL,
        ),
      },
      cookie: {
        title: t(chrome.cookie?.title, base.chrome.cookie.title, TITLE),
        lead: t(chrome.cookie?.lead, base.chrome.cookie.lead, PARA),
        privacyLabel: t(
          chrome.cookie?.privacyLabel,
          base.chrome.cookie.privacyLabel,
          LABEL,
        ),
        imprintLabel: t(
          chrome.cookie?.imprintLabel,
          base.chrome.cookie.imprintLabel,
          LABEL,
        ),
        btnNecessary: t(
          chrome.cookie?.btnNecessary,
          base.chrome.cookie.btnNecessary,
          LABEL,
        ),
        btnAcceptAll: t(
          chrome.cookie?.btnAcceptAll,
          base.chrome.cookie.btnAcceptAll,
          LABEL,
        ),
      },
      coursePromo: {
        kicker: t(
          chrome.coursePromo?.kicker,
          base.chrome.coursePromo.kicker,
          SHORT,
        ),
        nextLabel: t(
          chrome.coursePromo?.nextLabel,
          base.chrome.coursePromo.nextLabel,
          LABEL,
        ),
        more: t(chrome.coursePromo?.more, base.chrome.coursePromo.more, LABEL),
        close: t(
          chrome.coursePromo?.close,
          base.chrome.coursePromo.close,
          LABEL,
        ),
        atTime: t(
          chrome.coursePromo?.atTime,
          base.chrome.coursePromo.atTime,
          SHORT,
        ),
      },
      map: {
        kicker: t(chrome.map?.kicker, base.chrome.map.kicker, SHORT),
        consentText: t(
          chrome.map?.consentText,
          base.chrome.map.consentText,
          LEAD,
        ),
        load: t(chrome.map?.load, base.chrome.map.load, LABEL),
        openExternal: t(
          chrome.map?.openExternal,
          base.chrome.map.openExternal,
          LABEL,
        ),
      },
      locationLabels: {
        hours: t(
          chrome.locationLabels?.hours,
          base.chrome.locationLabels.hours,
          LABEL,
        ),
        phone: t(
          chrome.locationLabels?.phone,
          base.chrome.locationLabels.phone,
          LABEL,
        ),
        routeCta: t(
          chrome.locationLabels?.routeCta,
          base.chrome.locationLabels.routeCta,
          LABEL,
        ),
        mapsCta: t(
          chrome.locationLabels?.mapsCta,
          base.chrome.locationLabels.mapsCta,
          LABEL,
        ),
      },
    },
    home: {
      heroTitleLine1: t(
        home.heroTitleLine1,
        base.home.heroTitleLine1,
        TITLE,
      ),
      heroTitleLine2: t(
        home.heroTitleLine2,
        base.home.heroTitleLine2,
        TITLE,
      ),
      routeHint: t(home.routeHint, base.home.routeHint, LABEL),
      ctaMenu: t(home.ctaMenu, base.home.ctaMenu, LABEL),
      ctaMap: t(home.ctaMap, base.home.ctaMap, LABEL),
      brandName: t(home.brandName, base.home.brandName, TITLE),
      brandTagline: t(home.brandTagline, base.home.brandTagline, TITLE),
      kitchenEyebrow: t(home.kitchenEyebrow, base.home.kitchenEyebrow, LABEL),
      kitchenTitle: t(home.kitchenTitle, base.home.kitchenTitle, TITLE),
      kitchenP1: t(home.kitchenP1, base.home.kitchenP1, PARA),
      kitchenP2: t(home.kitchenP2, base.home.kitchenP2, PARA),
      kitchenCta: t(home.kitchenCta, base.home.kitchenCta, LABEL),
      offersCta: t(home.offersCta, base.home.offersCta, LABEL),
      offers: mergeOffers(home.offers, base.home.offers),
      takeawayEyebrow: t(
        home.takeawayEyebrow,
        base.home.takeawayEyebrow,
        LABEL,
      ),
      takeawayTitleLine1: t(
        home.takeawayTitleLine1,
        base.home.takeawayTitleLine1,
        TITLE,
      ),
      takeawayTitleLine2: t(
        home.takeawayTitleLine2,
        base.home.takeawayTitleLine2,
        TITLE,
      ),
      takeawayText: t(home.takeawayText, base.home.takeawayText, PARA),
      takeawayCta1: t(home.takeawayCta1, base.home.takeawayCta1, LABEL),
      takeawayCta2: t(home.takeawayCta2, base.home.takeawayCta2, LABEL),
      faqEyebrow: t(home.faqEyebrow, base.home.faqEyebrow, LABEL),
      faqTitle: t(home.faqTitle, base.home.faqTitle, TITLE),
      faqLead: t(home.faqLead, base.home.faqLead, LEAD),
    },
    speisekarte: {
      heroEyebrow: t(
        speisekarte.heroEyebrow,
        base.speisekarte.heroEyebrow,
        LABEL,
      ),
      heroTitle: t(speisekarte.heroTitle, base.speisekarte.heroTitle, TITLE),
      heroText: t(speisekarte.heroText, base.speisekarte.heroText, LEAD),
      pdfEyebrow: t(speisekarte.pdfEyebrow, base.speisekarte.pdfEyebrow, LABEL),
      pdfText: t(speisekarte.pdfText, base.speisekarte.pdfText, LEAD),
      pdfCta: t(speisekarte.pdfCta, base.speisekarte.pdfCta, LABEL),
      weeklyEyebrow: t(
        speisekarte.weeklyEyebrow,
        base.speisekarte.weeklyEyebrow,
        LABEL,
      ),
      weeklyTitle: t(
        speisekarte.weeklyTitle,
        base.speisekarte.weeklyTitle,
        TITLE,
      ),
      fullMenuCta: t(
        speisekarte.fullMenuCta,
        base.speisekarte.fullMenuCta,
        LABEL,
      ),
      chipWeekly: t(speisekarte.chipWeekly, base.speisekarte.chipWeekly, LABEL),
      chipPdf: t(speisekarte.chipPdf, base.speisekarte.chipPdf, LABEL),
    },
    catering: {
      heroEyebrow: t(catering.heroEyebrow, base.catering.heroEyebrow, LABEL),
      heroTitle: t(catering.heroTitle, base.catering.heroTitle, TITLE),
      heroText: t(catering.heroText, base.catering.heroText, LEAD),
      serviceEyebrow: t(
        catering.serviceEyebrow,
        base.catering.serviceEyebrow,
        LABEL,
      ),
      serviceTitle: t(catering.serviceTitle, base.catering.serviceTitle, TITLE),
      serviceLead: t(catering.serviceLead, base.catering.serviceLead, LEAD),
      offerings: mergeTitleTextPairs(
        catering.offerings,
        base.catering.offerings,
        6,
      ),
      ctaEmail: t(catering.ctaEmail, base.catering.ctaEmail, LABEL),
      ctaCall: t(catering.ctaCall, base.catering.ctaCall, LABEL),
      formHintBefore: t(
        catering.formHintBefore,
        base.catering.formHintBefore,
        LEAD,
      ),
      formHintLink: t(catering.formHintLink, base.catering.formHintLink, LABEL),
      formHintAfter: t(
        catering.formHintAfter,
        base.catering.formHintAfter,
        SHORT,
      ),
      formTitle: t(catering.formTitle, base.catering.formTitle, TITLE),
      formIntro: t(catering.formIntro, base.catering.formIntro, LEAD),
      formSubject: t(catering.formSubject, base.catering.formSubject, TITLE),
    },
    kochkurs: {
      heroEyebrow: t(kochkurs.heroEyebrow, base.kochkurs.heroEyebrow, LABEL),
      midEyebrow: t(kochkurs.midEyebrow, base.kochkurs.midEyebrow, LABEL),
      detailsEyebrow: t(
        kochkurs.detailsEyebrow,
        base.kochkurs.detailsEyebrow,
        LABEL,
      ),
      detailsTitle: t(kochkurs.detailsTitle, base.kochkurs.detailsTitle, TITLE),
      includesTitle: t(
        kochkurs.includesTitle,
        base.kochkurs.includesTitle,
        LABEL,
      ),
      bringTitle: t(kochkurs.bringTitle, base.kochkurs.bringTitle, LABEL),
      meetupTitle: t(kochkurs.meetupTitle, base.kochkurs.meetupTitle, LABEL),
      flowEyebrow: t(kochkurs.flowEyebrow, base.kochkurs.flowEyebrow, LABEL),
      flowTitle: t(kochkurs.flowTitle, base.kochkurs.flowTitle, TITLE),
      flowLead: t(kochkurs.flowLead, base.kochkurs.flowLead, LEAD),
      flowSteps: mergeFlowSteps(kochkurs.flowSteps, base.kochkurs.flowSteps),
      ctaEmail: t(kochkurs.ctaEmail, base.kochkurs.ctaEmail, LABEL),
      ctaCall: t(kochkurs.ctaCall, base.kochkurs.ctaCall, LABEL),
      formAltBefore: t(
        kochkurs.formAltBefore,
        base.kochkurs.formAltBefore,
        LEAD,
      ),
      formAltLink: t(kochkurs.formAltLink, base.kochkurs.formAltLink, LABEL),
      formAltAfter: t(kochkurs.formAltAfter, base.kochkurs.formAltAfter, SHORT),
      formTitle: t(kochkurs.formTitle, base.kochkurs.formTitle, TITLE),
      formIntro: t(kochkurs.formIntro, base.kochkurs.formIntro, LEAD),
      formSubject: t(kochkurs.formSubject, base.kochkurs.formSubject, TITLE),
      factTermin: t(kochkurs.factTermin, base.kochkurs.factTermin, SHORT),
      factBeginn: t(kochkurs.factBeginn, base.kochkurs.factBeginn, SHORT),
      factDauer: t(kochkurs.factDauer, base.kochkurs.factDauer, SHORT),
      factPreis: t(kochkurs.factPreis, base.kochkurs.factPreis, SHORT),
      factPlaetze: t(kochkurs.factPlaetze, base.kochkurs.factPlaetze, SHORT),
      factNiveau: t(kochkurs.factNiveau, base.kochkurs.factNiveau, SHORT),
      factGericht: t(kochkurs.factGericht, base.kochkurs.factGericht, SHORT),
    },
    mitnehmen: {
      eyebrow: t(mitnehmen.eyebrow, base.mitnehmen.eyebrow, LABEL),
      title: t(mitnehmen.title, base.mitnehmen.title, TITLE),
      lead: t(mitnehmen.lead, base.mitnehmen.lead, LEAD),
      block1Title: t(mitnehmen.block1Title, base.mitnehmen.block1Title, TITLE),
      block1P1: t(mitnehmen.block1P1, base.mitnehmen.block1P1, PARA),
      block1P2: t(mitnehmen.block1P2, base.mitnehmen.block1P2, PARA),
      block2Title: t(mitnehmen.block2Title, base.mitnehmen.block2Title, TITLE),
      block2P2: t(mitnehmen.block2P2, base.mitnehmen.block2P2, PARA),
      block3Title: t(mitnehmen.block3Title, base.mitnehmen.block3Title, TITLE),
      block3P1: t(mitnehmen.block3P1, base.mitnehmen.block3P1, PARA),
      ctaMenu: t(mitnehmen.ctaMenu, base.mitnehmen.ctaMenu, LABEL),
      ctaAnfahrt: t(mitnehmen.ctaAnfahrt, base.mitnehmen.ctaAnfahrt, LABEL),
    },
    ueberUns: {
      eyebrow: t(ueberUns.eyebrow, base.ueberUns.eyebrow, LABEL),
      title: t(ueberUns.title, base.ueberUns.title, TITLE),
      lead: t(ueberUns.lead, base.ueberUns.lead, LEAD),
      meaningTitle: t(ueberUns.meaningTitle, base.ueberUns.meaningTitle, TITLE),
      placeTitle: t(ueberUns.placeTitle, base.ueberUns.placeTitle, TITLE),
      placeP1: t(ueberUns.placeP1, base.ueberUns.placeP1, PARA),
      placeP2Prefix: t(
        ueberUns.placeP2Prefix,
        base.ueberUns.placeP2Prefix,
        SHORT,
      ),
      hoursTitle: t(ueberUns.hoursTitle, base.ueberUns.hoursTitle, TITLE),
      hoursP2: t(ueberUns.hoursP2, base.ueberUns.hoursP2, PARA),
      ctaMenu: t(ueberUns.ctaMenu, base.ueberUns.ctaMenu, LABEL),
      ctaKontakt: t(ueberUns.ctaKontakt, base.ueberUns.ctaKontakt, LABEL),
    },
    anfahrt: {
      eyebrow: t(anfahrt.eyebrow, base.anfahrt.eyebrow, LABEL),
      title: t(anfahrt.title, base.anfahrt.title, TITLE),
      lead: t(anfahrt.lead, base.anfahrt.lead, LEAD),
      addressTitle: t(anfahrt.addressTitle, base.anfahrt.addressTitle, TITLE),
      phoneLabel: t(anfahrt.phoneLabel, base.anfahrt.phoneLabel, SHORT),
      hoursTitle: t(anfahrt.hoursTitle, base.anfahrt.hoursTitle, TITLE),
      travelTitle: t(anfahrt.travelTitle, base.anfahrt.travelTitle, TITLE),
      travelText: t(anfahrt.travelText, base.anfahrt.travelText, PARA),
      ctaRoute: t(anfahrt.ctaRoute, base.anfahrt.ctaRoute, LABEL),
      ctaCall: t(anfahrt.ctaCall, base.anfahrt.ctaCall, LABEL),
      ctaKontakt: t(anfahrt.ctaKontakt, base.anfahrt.ctaKontakt, LABEL),
    },
    kontakt: {
      eyebrow: t(kontakt.eyebrow, base.kontakt.eyebrow, LABEL),
      title: t(kontakt.title, base.kontakt.title, TITLE),
      lead: t(kontakt.lead, base.kontakt.lead, LEAD),
      labelPhone: t(kontakt.labelPhone, base.kontakt.labelPhone, SHORT),
      labelEmail: t(kontakt.labelEmail, base.kontakt.labelEmail, SHORT),
      labelAddress: t(kontakt.labelAddress, base.kontakt.labelAddress, SHORT),
      labelHours: t(kontakt.labelHours, base.kontakt.labelHours, SHORT),
      mapsLink: t(kontakt.mapsLink, base.kontakt.mapsLink, LABEL),
      formTitle: t(kontakt.formTitle, base.kontakt.formTitle, TITLE),
      formIntro: t(kontakt.formIntro, base.kontakt.formIntro, LEAD),
      formSubject: t(kontakt.formSubject, base.kontakt.formSubject, TITLE),
    },
    faqs: mergeFaqs(r.faqs, base.faqs),
    contactForm: {
      defaultTitle: t(
        contactForm.defaultTitle,
        base.contactForm.defaultTitle,
        TITLE,
      ),
      defaultIntro: t(
        contactForm.defaultIntro,
        base.contactForm.defaultIntro,
        LEAD,
      ),
      nameLabel: t(contactForm.nameLabel, base.contactForm.nameLabel, SHORT),
      emailLabel: t(contactForm.emailLabel, base.contactForm.emailLabel, SHORT),
      phoneLabel: t(contactForm.phoneLabel, base.contactForm.phoneLabel, LABEL),
      messageLabel: t(
        contactForm.messageLabel,
        base.contactForm.messageLabel,
        SHORT,
      ),
      submit: t(contactForm.submit, base.contactForm.submit, LABEL),
      sending: t(contactForm.sending, base.contactForm.sending, LABEL),
      sent: t(contactForm.sent, base.contactForm.sent, PARA),
      errorSend: t(contactForm.errorSend, base.contactForm.errorSend, LEAD),
      errorNetwork: t(
        contactForm.errorNetwork,
        base.contactForm.errorNetwork,
        LEAD,
      ),
    },
    speisekarteUi: {
      weekEyebrow: t(
        speisekarteUi.weekEyebrow,
        base.speisekarteUi.weekEyebrow,
        LABEL,
      ),
      weekTitle: t(
        speisekarteUi.weekTitle,
        base.speisekarteUi.weekTitle,
        TITLE,
      ),
      toFullMenu: t(
        speisekarteUi.toFullMenu,
        base.speisekarteUi.toFullMenu,
        LABEL,
      ),
      markingTitle: t(
        speisekarteUi.markingTitle,
        base.speisekarteUi.markingTitle,
        TITLE,
      ),
      markingText: t(
        speisekarteUi.markingText,
        base.speisekarteUi.markingText,
        PARA,
      ),
    },
    updatedAt: String(r.updatedAt || new Date().toISOString()),
  };
}
