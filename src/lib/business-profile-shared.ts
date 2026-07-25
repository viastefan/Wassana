import { sanitizeText } from "@/lib/security";

export type BusinessProfile = {
  fullName: string;
  shortName: string;
  owner: string;
  street: string;
  zip: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  taxNote: string;
  updatedAt?: string;
};

export type ResolvedBusiness = BusinessProfile & {
  phoneHref: string;
  phoneE164: string;
  emailHref: string;
  cookingEmailHref: string;
  cateringEmailHref: string;
  maps: {
    query: string;
    embed: string;
    directions: string;
    place: string;
  };
};

export function defaultBusinessProfile(): BusinessProfile {
  return {
    fullName: "Wassanas Thai Imbiss und Feinkost",
    shortName: "Wassana Thai Imbiss Landshut",
    owner: "Pramot Yotkhrongmueang",
    street: "Regierungsplatz 542",
    zip: "84028",
    city: "Landshut",
    region: "Bayern",
    country: "DE",
    phone: "0871/9745862",
    email: "wassanathaiimbiss@icloud.de",
    instagram: "https://www.instagram.com/wassanathaiimbiss/",
    instagramHandle: "@wassanathaiimbiss",
    facebook:
      "https://www.facebook.com/pages/Wassanas-Thai-Imbiss-Feinkost/156423611044359",
    taxNote:
      "Als Kleinunternehmer bzw. soweit keine Umsatzsteuer-ID ausgewiesen ist, gilt ggf. § 19 UStG.",
  };
}

function digitsToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("49")) return `+${digits}`;
  if (digits.startsWith("0")) return `+49${digits.slice(1)}`;
  return `+${digits}`;
}

export function resolveBusiness(profile: BusinessProfile): ResolvedBusiness {
  const phoneE164 = digitsToE164(profile.phone);
  const query = `${profile.fullName}, ${profile.street}, ${profile.zip} ${profile.city}`;
  const destination = `${profile.street}, ${profile.zip} ${profile.city}`;
  return {
    ...profile,
    phoneHref: phoneE164 ? `tel:${phoneE164}` : `tel:${profile.phone}`,
    phoneE164: phoneE164 || profile.phone,
    emailHref: `mailto:${profile.email}`,
    cookingEmailHref: `mailto:${profile.email}?subject=${encodeURIComponent("Kochkurs Anfrage")}`,
    cateringEmailHref: `mailto:${profile.email}?subject=${encodeURIComponent("Catering Anfrage")}`,
    maps: {
      query,
      embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=de&z=16&output=embed`,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      place: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    },
  };
}

export function normalizeBusinessProfile(
  raw: Partial<BusinessProfile> | null | undefined,
): BusinessProfile {
  const base = defaultBusinessProfile();
  return {
    fullName: sanitizeText(String(raw?.fullName ?? base.fullName), 160) || base.fullName,
    shortName: sanitizeText(String(raw?.shortName ?? base.shortName), 120) || base.shortName,
    owner: sanitizeText(String(raw?.owner ?? base.owner), 120) || base.owner,
    street: sanitizeText(String(raw?.street ?? base.street), 120) || base.street,
    zip: sanitizeText(String(raw?.zip ?? base.zip), 16) || base.zip,
    city: sanitizeText(String(raw?.city ?? base.city), 80) || base.city,
    region: sanitizeText(String(raw?.region ?? base.region), 80) || base.region,
    country: sanitizeText(String(raw?.country ?? base.country), 8) || base.country,
    phone: sanitizeText(String(raw?.phone ?? base.phone), 40) || base.phone,
    email: sanitizeText(String(raw?.email ?? base.email), 120) || base.email,
    instagram: sanitizeText(String(raw?.instagram ?? base.instagram), 240) || base.instagram,
    instagramHandle:
      sanitizeText(String(raw?.instagramHandle ?? base.instagramHandle), 80) ||
      base.instagramHandle,
    facebook: sanitizeText(String(raw?.facebook ?? base.facebook), 240) || base.facebook,
    taxNote: sanitizeText(String(raw?.taxNote ?? base.taxNote), 400) || base.taxNote,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
  };
}
