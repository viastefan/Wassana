/** Curated homepage testimonials + platform links (Google / TripAdvisor). */

export type ReviewPlatform = "google" | "tripadvisor" | "golocal";

export type ReviewQuote = {
  author: string;
  rating: 4 | 5;
  source: ReviewPlatform;
  text: string;
  when: string;
};

export const reviewPlatforms = {
  google: {
    name: "Google",
    rating: 4.3,
    count: 16,
    href: "https://www.google.com/maps/search/?api=1&query=Wassanas%20Thai%20Imbiss%20und%20Feinkost%2C%20Regierungsplatz%20542%2C%2084028%20Landshut",
  },
  tripadvisor: {
    name: "Tripadvisor",
    href: "https://www.tripadvisor.de/Restaurant_Review-g229466-d5520934-Reviews-Wassana_s_Thai_Imbiss-Landshut_Lower_Bavaria_Bavaria.html",
  },
} as const;

/** Strong 4–5★ quotes for homepage social proof (not a dump of every review). */
export const homepageReviews: ReviewQuote[] = [
  {
    author: "panahlysis",
    rating: 5,
    source: "google",
    when: "vor 10 Monaten",
    text: "Immer sehr lecker, immer frisch. Bin seit Jahren Stammkunde und wurde von der Qualität noch nie enttäuscht!",
  },
  {
    author: "Anita Ru.",
    rating: 5,
    source: "google",
    when: "vor 3 Monaten",
    text: "Zur Mittagszeit ist hier schon viel los, aber das Essen ist fantastisch! Auf jeden Fall komme ich wieder :-)",
  },
  {
    author: "Google-Gast",
    rating: 5,
    source: "google",
    when: "vor einem Jahr",
    text: "Unser Essen wurde bereits fünf Minuten nach der Bestellung serviert. Die Nudeln waren sehr lecker — und das Preis-Leistungs-Verhältnis hervorragend.",
  },
  {
    author: "dk",
    rating: 5,
    source: "google",
    when: "vor 8 Monaten",
    text: "Top Service, top Essen! Wirklich lecker und preisgünstig — auch zur Rushhour waren sie schnell.",
  },
  {
    author: "Stammgast",
    rating: 5,
    source: "golocal",
    when: "vor einem Jahr",
    text: "Wir gehen seit Jahren sehr gerne dort hin und wurden bisher nie enttäuscht. Auch Extrawünsche werden erfüllt — Preise absolut fair.",
  },
  {
    author: "Christian Lauer",
    rating: 4,
    source: "google",
    when: "vor einem Jahr",
    text: "Nach unserem Thailandurlaub konnten wir es nicht erwarten, wieder thailändisch zu essen — bei Wassana in Landshut.",
  },
];

export function sourceLabel(source: ReviewPlatform): string {
  if (source === "google") return "Google";
  if (source === "tripadvisor") return "Tripadvisor";
  return "golocal";
}
