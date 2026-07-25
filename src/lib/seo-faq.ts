/** Visible FAQ + matching FAQPage JSON-LD (Google requires visible content). */

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export const landshutFaqs: SeoFaqItem[] = [
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
      "Ja. Mo–Fr gibt es wechselnde beliebte Gerichte der Woche. Für Schülerinnen, Schüler und Azubis gibt es mittags ein Angebot inkl. Softgetränk — gegen Vorlage eines Ausweises. Details stehen auf der Seite Schüler Mittagessen Landshut.",
  },
  {
    question: "Bietet Wassana Catering und Kochkurse in Landshut an?",
    answer:
      "Ja. Wir bieten Catering für Events und Thai-Kochkurse in Landshut an. Anfragen am besten über das Kontaktformular oder telefonisch unter 0871/9745862.",
  },
];
