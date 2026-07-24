export const site = {
  name: "Wassana",
  fullName: "Wassanas Thai Imbiss und Feinkost",
  tagline: "Thai Imbiss",
  owner: "Pramot Yotkhrongmueang",
  address: {
    street: "Regierungsplatz 542",
    zip: "84028",
    city: "Landshut",
  },
  phone: "0871/9745862",
  phoneHref: "tel:+498719745862",
  email: "Wassana.Huber@t-online.de",
  emailHref: "mailto:Wassana.Huber@t-online.de",
  cookingEmail: "Albert-Ewen@GMX.de",
  cookingEmailHref: "mailto:Albert-Ewen@GMX.de?subject=Kochkurs%20Anfrage",
  cateringEmailHref:
    "mailto:Wassana.Huber@t-online.de?subject=Catering%20Anfrage",
  hours: {
    weekdays: "Mo–Fr 11:00–18:00",
    weekdaysLong: "Montag bis Freitag von 11:00–18:00 Uhr",
    weekend: "Sa, So & Feiertage geschlossen",
  },
  social: {
    facebook:
      "https://www.facebook.com/pages/Wassanas-Thai-Imbiss-Feinkost/156423611044359",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Start" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/catering", label: "Catering" },
  { href: "/kochkurs", label: "Kochkurs" },
  { href: "/kontakt", label: "Kontakt" },
] as const;
