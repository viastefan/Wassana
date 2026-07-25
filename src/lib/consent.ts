/** Client-safe consent helpers for TTDSG / cookie banner. */

export const CONSENT_STORAGE_KEY = "wassana-consent-v1";
export const CONSENT_COOKIE_NAME = "wassana_consent";
/** Bump when optional categories or policy text change → re-prompt. */
export const CONSENT_VERSION = 1;
/** Cookie lifetime: 1 year (common CMP practice). */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentState = {
  version: number;
  necessary: true;
  /** Google Maps embed (third-party, only after opt-in). */
  maps: boolean;
  updatedAt: string;
};

export type ConsentCategory = {
  id: "necessary" | "maps";
  title: string;
  description: string;
  required: boolean;
};

export const CONSENT_CATEGORIES: ConsentCategory[] = [
  {
    id: "necessary",
    title: "Notwendig",
    description:
      "Speichert Ihre Einwilligungsauswahl und wenige Komfort-Einstellungen (z. B. geschlossene Hinweise). Kein Tracking.",
    required: true,
  },
  {
    id: "maps",
    title: "Google Maps",
    description:
      "Lädt die interaktive Karte von Google. Dabei können Daten an Google in die EU/USA übermittelt werden.",
    required: false,
  },
];

export function createConsent(maps: boolean): ConsentState {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    maps: Boolean(maps),
    updatedAt: new Date().toISOString(),
  };
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed?.necessary !== true || typeof parsed.maps !== "boolean") {
      return null;
    }
    const version = Number(parsed.version ?? 0);
    if (version !== CONSENT_VERSION) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      necessary: true,
      maps: parsed.maps,
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function writeConsentCookie(state: ConsentState) {
  if (typeof document === "undefined") return;
  const payload = encodeURIComponent(JSON.stringify(state));
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearConsentCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Read stored consent from localStorage, falling back to first-party cookie. */
export function readStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    // private mode / blocked storage
  }
  return parseConsent(readCookie(CONSENT_COOKIE_NAME));
}

/** Persist consent to localStorage + first-party cookie and notify listeners. */
export function persistConsent(state: ConsentState): ConsentState {
  const next = {
    ...state,
    version: CONSENT_VERSION,
    necessary: true as const,
    maps: Boolean(state.maps),
    updatedAt: state.updatedAt || new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // still write cookie if storage is blocked
  }
  writeConsentCookie(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("wassana-consent", { detail: next }),
    );
  }
  return next;
}

export function clearStoredConsent() {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
  clearConsentCookie();
}

/** Inline bootstrap: mark html before paint if no valid consent yet. */
export const CONSENT_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(CONSENT_STORAGE_KEY)},c=${JSON.stringify(CONSENT_COOKIE_NAME)},v=${CONSENT_VERSION};function ok(raw){if(!raw)return false;try{var p=JSON.parse(raw);return p&&p.necessary===true&&typeof p.maps==="boolean"&&Number(p.version||0)===v;}catch(e){return false;}}var stored=null;try{stored=localStorage.getItem(k);}catch(e){}if(ok(stored))return;var cookie=null;try{var parts=document.cookie.split("; ");for(var i=0;i<parts.length;i++){var eq=parts[i].indexOf("=");if(eq===-1)continue;if(parts[i].slice(0,eq)===c){cookie=decodeURIComponent(parts[i].slice(eq+1));break;}}}catch(e){}if(ok(cookie))return;document.documentElement.classList.add("has-cookie-banner");}catch(e){document.documentElement.classList.add("has-cookie-banner");}})();`;
