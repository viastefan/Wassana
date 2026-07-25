import path from "path";
import {
  defaultBusinessProfile,
  normalizeBusinessProfile,
  resolveBusiness,
  type BusinessProfile,
  type ResolvedBusiness,
} from "@/lib/business-profile-shared";
import {
  readJsonWithFallback,
  writeJsonWithFallback,
  type PersistResult,
} from "@/lib/persist-json";

export type { BusinessProfile, ResolvedBusiness } from "@/lib/business-profile-shared";
export {
  defaultBusinessProfile,
  normalizeBusinessProfile,
  resolveBusiness,
} from "@/lib/business-profile-shared";

const DATA_PATH = path.join(process.cwd(), "data", "business-profile.json");
const TMP_PATH = path.join("/tmp", "wassana-business-profile.json");

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const raw = await readJsonWithFallback<Partial<BusinessProfile>>(
    DATA_PATH,
    TMP_PATH,
    "data/business-profile.json",
  );
  if (raw) return normalizeBusinessProfile(raw);
  return defaultBusinessProfile();
}

export async function getResolvedBusiness(): Promise<ResolvedBusiness> {
  return resolveBusiness(await getBusinessProfile());
}

export async function saveBusinessProfile(
  input: Omit<BusinessProfile, "updatedAt">,
): Promise<{ profile: BusinessProfile; persist: PersistResult }> {
  const next = normalizeBusinessProfile({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  const payload = `${JSON.stringify(next, null, 2)}\n`;
  const persist = await writeJsonWithFallback(
    DATA_PATH,
    TMP_PATH,
    payload,
    "data/business-profile.json",
    "chore: update business profile from admin",
  );
  if (!persist.durable && !persist.tmp) {
    throw new Error(
      persist.error || "Betriebsdaten konnten nicht gespeichert werden.",
    );
  }
  return { profile: next, persist };
}
