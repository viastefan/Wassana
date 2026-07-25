export const CONSENT_STORAGE_KEY = "wassana-consent-v1";

export type ConsentState = {
  necessary: true;
  maps: boolean;
  updatedAt: string;
};

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed?.necessary !== true || typeof parsed.maps !== "boolean") {
      return null;
    }
    return {
      necessary: true,
      maps: parsed.maps,
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export function createConsent(maps: boolean): ConsentState {
  return {
    necessary: true,
    maps,
    updatedAt: new Date().toISOString(),
  };
}
