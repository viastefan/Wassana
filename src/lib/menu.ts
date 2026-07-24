export type MenuItem = {
  nr: string;
  name: string;
  description?: string;
  price: string;
  allergens?: string;
  prices?: { label: string; price: string }[];
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export const weeklyMenu = {
  note: "Alle Speisen werden mit Duftreis serviert",
  days: [
    {
      day: "Montag",
      dish: "Gelbes Curry",
      description: "mit Kartoffeln, Karotten, Zwiebeln",
      items: [
        { nr: "55", name: "Huhn, Schwein", price: "8,90 €" },
        { nr: "56", name: "Rind", price: "9,90 €" },
        { nr: "57", name: "vegetarisch", price: "7,90 €" },
      ],
    },
    {
      day: "Dienstag",
      dish: "Massaman Curry",
      description:
        "Kokoscurry, Kartoffeln, Palmzucker, Tamarind & gemahlene Erdnüsse",
      allergens: "E",
      items: [
        { nr: "66", name: "Huhn, Schwein", price: "8,90 €" },
        { nr: "67", name: "Rind", price: "9,90 €" },
        { nr: "68", name: "vegetarisch", price: "7,90 €" },
      ],
    },
    {
      day: "Mittwoch",
      dish: "Fischcurry",
      items: [
        { nr: "90", name: "Sojasauce", price: "9,50 €", allergens: "A,B,C" },
        { nr: "91", name: "Kokoscurry", price: "9,50 €" },
      ],
    },
    {
      day: "Donnerstag",
      dish: "Pad ka pao",
      description: "verschiedene Gemüse, Knoblauch, „heiliger Basilikum“",
      allergens: "A,B,C",
      items: [
        { nr: "77", name: "Huhn, Schwein", price: "8,90 €" },
        { nr: "78", name: "Rind", price: "9,90 €" },
        { nr: "79", name: "vegetarisch", price: "7,90 €" },
      ],
    },
    {
      day: "Freitag",
      dish: "Tilapia (Buntbarsch)",
      description: "weich & fein im Geschmack",
      items: [
        { nr: "90", name: "Sojasauce", price: "9,50 €", allergens: "A,B,C" },
        { nr: "91", name: "Kokoscurry", price: "9,50 €" },
        { nr: "92", name: "Fischsuppe – Tilapia", price: "9,50 €" },
        { nr: "93", name: "Fischsuppe – Wildlachs", price: "9,90 €" },
      ],
    },
  ],
} as const;

export const menuSections: MenuSection[] = [
  {
    id: "vorspeisen",
    title: "Vorspeisen",
    items: [
      {
        nr: "6",
        name: "Kleine Frühlingsrollen",
        price: "3,20 €",
      },
      {
        nr: "6",
        name: "Panierte Garnelen",
        description: "süß-saure Sauce",
        price: "5,20 €",
        allergens: "A",
      },
      {
        nr: "",
        name: "Feine Hühnersuppe",
        description: "Filetstreifen & Gemüse",
        price: "4,20 €",
      },
    ],
  },
  {
    id: "hauptgerichte",
    title: "Hauptgerichte",
    items: [
      {
        nr: "1",
        name: "Gebratene Nudeln",
        description: "mit zartem Hühnerbrustfilet, frischem Gemüse",
        price: "8,90 €",
        allergens: "C,D,E",
      },
      {
        nr: "2",
        name: "Gebratene Streifen",
        description:
          "Schweinelende oder Hühnchen mit frischem Gemüse der Saison, Duftreis",
        price: "8,90 €",
        allergens: "A,B,C",
      },
      {
        nr: "3",
        name: "Grünes, gelbes oder rotes Kokoscurry",
        description:
          "wahlweise mit Hühnerbrustfilet oder Schweinefleisch, frischem Gemüse, Duftreis, angenehme Schärfe",
        price: "8,90 €",
      },
      {
        nr: "4",
        name: "Spezialität des Hauses",
        description:
          "Gebratener Duftreis mit Hühnerbrustfilet, Ei, Tomaten, Zwiebeln",
        price: "8,90 €",
        allergens: "A,B,C",
      },
      {
        nr: "5",
        name: "Panengcurry",
        description: "Hühnerbrustfilet, Gemüse, Duftreis",
        price: "8,90 €",
      },
      {
        nr: "6",
        name: "Hühnerbrustfilet mit Cashewnüssen",
        description: "Tomaten, Zwiebeln, Paprika, Duftreis",
        price: "9,20 €",
        allergens: "A,B,C",
      },
      {
        nr: "7",
        name: "Süß-sauer",
        description:
          "Schweinelende oder Hühnchen, Tomaten, Zwiebeln, Paprika, Duftreis",
        price: "8,90 €",
        allergens: "2,A,B,C,E",
      },
      {
        nr: "8",
        name: "Entenbrustfilet mit Bambussprossen",
        description: "Sojasauce, Gemüse der Saison, Duftreis",
        price: "9,90 €",
        allergens: "A,B,C",
      },
      {
        nr: "9",
        name: "Entenbrustfilet, roter Kokoscurry",
        description: "Ananas, Tomaten, Duftreis",
        price: "9,90 €",
      },
      {
        nr: "10",
        name: "Entenbrustfilet mit Curry",
        description: "roter, gelber oder grüner Kokoscurry, Gemüse, Duftreis",
        price: "9,90 €",
      },
      {
        nr: "101",
        name: "Ente süß-sauer",
        description: "frisches Gemüse, Duftreis",
        price: "9,90 €",
        allergens: "2,A,B,C,E",
      },
      {
        nr: "104",
        name: "Gebratene Nudeln mit Ente",
        description: "knuspriges Entenbrustfilet, Gemüse",
        price: "9,90 €",
        allergens: "C,D,E",
      },
      {
        nr: "51",
        name: "Pad thai gai",
        description:
          "gebratene Reisnudeln, Hühnerbrustfilet, Sojasprossen, Lauchzwiebeln, Erdnüsse, Ei, Tofu",
        price: "8,90 €",
        allergens: "C,E",
      },
    ],
  },
  {
    id: "salat",
    title: "Salat",
    items: [
      {
        nr: "102",
        name: "Yam wun sen",
        description:
          "Glasnudelsalat mit Hühnerbrustfilet, Riesengarnelen, Cashewnüssen, Tomaten, Koriander, Zwiebeln",
        price: "9,90 €",
        allergens: "E",
      },
    ],
  },
  {
    id: "suppen",
    title: "Suppen",
    items: [
      {
        nr: "11",
        name: "Tom Kha gai",
        description: "sauer-scharfe Suppe, Hühnerbrustfilet, Gemüse, Koriander, Reis",
        price: "klein 4,50 € · groß 8,50 €",
        allergens: "1",
      },
      {
        nr: "111",
        name: "Tom yam gung",
        description:
          "sauer-scharfe Suppe mit Riesengarnelen, Pilze, Koriander, Reis",
        price: "klein 5,20 € · groß 9,90 €",
        allergens: "1",
      },
      {
        nr: "112",
        name: "Hühnersuppe Thai Art",
        description: "mit Gemüse, Duftreis und Filetstreifen",
        price: "8,50 €",
        allergens: "1,B",
      },
    ],
  },
  {
    id: "fisch",
    title: "Fisch & Meeresfrüchte",
    items: [
      {
        nr: "12",
        name: "Wildlachsfilet",
        description: "in rotem oder gelbem Kokoscurry, frisches Gemüse, Duftreis",
        price: "9,90 €",
      },
      {
        nr: "13",
        name: "Riesengarnelen mit gebratenen Nudeln",
        description: "frisches Gemüse",
        price: "9,90 €",
        allergens: "A,B,C,D,E",
      },
      {
        nr: "14",
        name: "Gebratener Reis mit Riesengarnelen",
        description: "und Gemüse",
        price: "9,90 €",
        allergens: "A,B,C,D,E",
      },
      {
        nr: "15",
        name: "Riesengarnelen süß-sauer",
        description: "Gemüse, Duftreis",
        price: "9,90 €",
        allergens: "2,A,B,C,D,E",
      },
      {
        nr: "16",
        name: "Riesengarnelen mit Curry",
        description: "grünes oder rotes Curry, Gemüse, Duftreis",
        price: "9,90 €",
      },
      {
        nr: "17",
        name: "Panengcurry mit Riesengarnelen",
        description: "Duftreis – sehr pikant",
        price: "9,90 €",
      },
      {
        nr: "52",
        name: "Pad thai gung",
        description:
          "gebratene Reisnudeln, Riesengarnelen, Sojasprossen, Ei, Tofu, Lauchzwiebeln, Erdnüsse",
        price: "9,90 €",
      },
      {
        nr: "18",
        name: "Tintenfisch mit Gemüse",
        description: "frisches Gemüse und leckerer Sauce",
        price: "9,90 €",
        allergens: "A,B,C,E",
      },
      {
        nr: "19",
        name: "Tintenfisch mit Kokoscurry",
        description: "grün, rot oder gelb, Gemüse, Duftreis",
        price: "9,90 €",
      },
    ],
  },
  {
    id: "vegetarisch",
    title: "Vegetarisch",
    note:
      "Alle vegetarischen Gerichte mit Kokoscurry sind vegan. Alle Gerichte auch mit Tofu möglich (+0,50 €).",
    items: [
      {
        nr: "20",
        name: "Rotes, grünes oder gelbes Kokoscurry",
        description: "mit Gemüse",
        price: "7,90 €",
      },
      {
        nr: "21",
        name: "Panengcurry mit frischem Gemüse",
        description: "Duftreis",
        price: "7,90 €",
      },
      {
        nr: "22",
        name: "Gebratene Nudeln oder gebratener Reis",
        description: "mit Gemüse",
        price: "7,90 €",
        allergens: "A,B,C,D,E",
      },
      {
        nr: "23",
        name: "Gebratenes Gemüse",
        description: "mit leckerer Sauce und Reis",
        price: "7,90 €",
      },
      {
        nr: "24",
        name: "Frisches Gemüse, süß-sauer",
        price: "7,90 €",
      },
      {
        nr: "25",
        name: "Tom kha Suppe",
        description: "sauer-scharf, Gemüse, Duftreis",
        price: "7,90 €",
        allergens: "1",
      },
      {
        nr: "26",
        name: "Gemüsesuppe",
        description: "mit frischem Gemüse der Saison",
        price: "7,90 €",
      },
      {
        nr: "27",
        name: "Frisches Ingwergemüse",
        description: "mit Sojasauce, Duftreis",
        price: "7,90 €",
        allergens: "A,B,C",
      },
      {
        nr: "50",
        name: "Pad Thai",
        description: "gebratene Reisnudeln, Tofu, Gemüse, Erdnüsse",
        price: "7,90 €",
        allergens: "C,E",
      },
    ],
  },
  {
    id: "rind",
    title: "Rindfleisch",
    items: [
      {
        nr: "40",
        name: "Gebratenes Rindfleisch mit Thai-Basilikum",
        description: "Gemüse, Duftreis (scharf)",
        price: "9,90 €",
      },
      {
        nr: "41",
        name: "Gebratenes Rindfleisch, Sojasauce",
        description: "Gemüse, Duftreis",
        price: "9,90 €",
        allergens: "A,C,E",
      },
      {
        nr: "42",
        name: "Rindfleisch süß-sauer",
        description: "Gemüse, Duftreis",
        price: "9,90 €",
        allergens: "2",
      },
      {
        nr: "43",
        name: "Rinderlende mit Kokoscurry",
        description: "nach Wahl, Gemüse, Duftreis",
        price: "9,90 €",
      },
    ],
  },
  {
    id: "getraenke",
    title: "Getränke",
    items: [
      {
        nr: "31",
        name: "Cola, Fanta, Sprite, Mezzo Mix, Apfelschorle",
        price: "2,50 €*",
      },
      {
        nr: "32",
        name: "Dosengetränke",
        price: "2,50 €*",
      },
      {
        nr: "33",
        name: "Bier",
        price: "2,80 €",
      },
    ],
  },
];

export const allergens = [
  { code: "1", label: "Geschmacksverstärker, E333, Säuerungsmittel" },
  { code: "2", label: "Farbstoff" },
  { code: "A", label: "Weizen" },
  { code: "B", label: "Soja" },
  { code: "C", label: "Austernsauce" },
  { code: "D", label: "Ei" },
  { code: "E", label: "Fischsauce" },
  { code: "F", label: "Gluten" },
] as const;
