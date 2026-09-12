# Wassana — Übergabe

Live: https://www.wassana-thai-imbiss.de  
Admin: https://www.wassana-thai-imbiss.de/admin  
(Zugang: Firmenname „Wassanas Thai Imbiss und Feinkost“ tippen)

## Für den Besitzer

Das Verwaltungsprogramm heißt **Site Manager** und läuft im Browser unter `/admin`.
Links steht die Navigation mit genau vier Bereichen:

| Bereich | Was du damit machst |
|---|---|
| **Speisekarte** | Wochenkarte (Gericht, Preis) und darunter die komplette Speisekarte |
| **Angebote** | Top-Banner über der Website und das Schüler-Mittag-Angebot |
| **Anfragen** | Kontaktanfragen: Status, Notizen, Archiv, Löschen |
| **Betrieb** | Öffnungszeiten, Inhaber- und Kontaktdaten, Live-Status, Abmelden |

Nach jedem Veröffentlichen prüft das Programm selbst, ob der neue Text
tatsächlich auf der Website steht, und meldet Erfolg erst dann.

## Vercel (einmalig prüfen)

Project **wassana** → Settings → Environment Variables:

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD` | **Pflicht** — Passwort für `/admin` (ohne Default in Production) |
| `ADMIN_SESSION_SECRET` | Optional — separates Cookie-Secret |
| `NEXT_PUBLIC_SITE_URL` | `https://www.wassana-thai-imbiss.de` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | E-Mail-Versand Kontaktformular |
| `CONTACT_TO` | Empfänger (Inhaber-Mail) |
| `BLOB_READ_WRITE_TOKEN` | **Pflicht** — ohne diesen Speicher geht keine Änderung live. Wird automatisch gesetzt, sobald ein Blob-Store am Projekt hängt (Storage → Create Database → Blob). Nicht von Hand eintragen. |
| `GITHUB_TOKEN` (+ optional `GITHUB_REPO`) | Optional — Backup der CMS-JSONs ins Repo |
| SMTP_* / `CONTACT_TO` | Für Kontaktmails + Admin-Support/Passwort-Reset an `stefandirnberger@viawen.com` |
| `INQUIRIES_SECRET` | Optional — eigener Schlüssel für Anfragen-Verschlüsselung |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search-Console Meta |

Nach Änderungen an Env-Variablen: Redeploy.

### Admin → Live Website (wichtig)

Auf Vercel speichert der Admin so:

1. **Vercel Blob, versioniert** (jede Veröffentlichung = neue Datei, kein CDN-Altstand)
2. kurz zusätzlich in `/tmp` und im Speicher der Function
3. optional GitHub-Backup, falls `GITHUB_TOKEN` gesetzt ist

`BLOB_READ_WRITE_TOKEN` ist Pflicht für Live-Änderungen (Speisekarte, Angebote, Öffnungszeiten, Betrieb).  
Auf Vercel zählt **nur Blob** als live — GitHub-Backup und `/tmp` allein reichen nicht. Ohne Token sagt der Admin klar „Speicher fehlt“ und speichert nicht als live.

Alte überschreibende Blob-Dateien (`cms/data/...`) werden nur noch als Fallback gelesen. Neue Saves liegen unter `cms/v/data/.../<zeitstempel>.json`.

Optional: `GITHUB_TOKEN` für Versionshistorie im Repo (nicht mehr nötig für Live).

## Rechtliches / Cookies

- Cookie-Banner mit Links zu Datenschutz & Impressum
- Google Maps erst nach Zustimmung
- Footer-Link **Cookies** öffnet den Hinweis erneut

## Google / SEO / SEA live schalten

### A) Search Console (Vertrauen + Index)

1. [Google Search Console](https://search.google.com/search-console) → Property **`https://www.wassana-thai-imbiss.de`** (www!)
2. Eigentum bestätigen (DNS-TXT bei IONOS **oder** HTML-Meta):
   - Meta: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel setzen → Redeploy
3. **Sitemap** einreichen: `https://www.wassana-thai-imbiss.de/sitemap.xml`  
   (Build-Zeit aus allen öffentlichen `page.tsx`; Locs = Canonical-URLs, nur www, ohne trailing slash)
4. **URL-Prüfung** → Indexierung beantragen für:
   - `/` · `/speisekarte` · `/mitnehmen` · `/schueler-mittagessen`
   - `/kontakt` · `/anfahrt` · `/catering` · `/kochkurs` · `/ueber-uns`
5. **Verbesserungen → Rich-Suchergebnisse** prüfen (FAQ, Event, Breadcrumbs)
6. Optional: Bing Webmaster Tools mit derselben Sitemap

### B) Rich Links / Sitelinks unter dem Google-Eintrag

Google entscheidet selbst, wann Sitelinks (wie bei Safari) erscheinen. Technisch vorbereitet:

- Klare Navigation + `SiteNavigationElement` JSON-LD
- Eigene Seitentitel/Canonicals für Speisekarte, Catering, Kochkurs, Kontakt
- Breadcrumbs, Sitemap, www-only Canonicals
- FAQ auf der Startseite (sichtbar + `FAQPage`)
- Speisekarte als `Menu` Schema
- Kochkurs als `Event` Schema (wenn Termin aktiv; Termin wird direkt in `data/cooking-course.json` gepflegt, nicht im Site Manager)
- Restaurant / LocalBusiness mit Adresse, Geo, Öffnungszeiten, `sameAs` (Facebook/Instagram)

**Zusätzlich wichtig:** Google Business Profile (unten) — ohne GBP kaum lokales Pack in Landshut.

### C) Google Business Profile (Maps + lokale Suche Landshut)

1. Profil beanspruchen/bestätigen für **Regierungsplatz 542, 84028 Landshut**
2. Website exakt: `https://www.wassana-thai-imbiss.de`
3. Kategorie: **Thai-Restaurant** / Imbiss · Öffnungszeiten Mo–Fr 11–18
4. Telefon `0871/9745862` · Fotos (Logo, Gerichte, Laden) hochladen
5. Produkte/Menü + Beiträge regelmäßig pflegen
6. Kunden um echte Bewertungen bitten (keine Fake-Sterne auf der Website)

Technisch vorbereitet: Canonicals (nur www), Open Graph, JSON-LD (Restaurant/Menu/FAQ/Event/Sitelinks), Sitemap, Robots, Security-Header, HSTS, Safari-/PWA-Icons (`site.webmanifest`).

## Sicherheit (kurz)

- Security-Header + CSP + HSTS
- Scanner-Pfade blockiert (`wp-admin`, `.env`, …)
- Rate-Limits auf Kontakt & Admin-Login
- Origin-Check auf mutierenden APIs
- Kein Default-Admin-Passwort in Production
- Kontakt-Anfragen (PII) werden **nicht** ins GitHub-Repo geschrieben
- Anfragen-DB im Admin: Status (Neu/Offen/Erledigt), private Notizen, Archiv, Löschen
- Dauerhaft auf Vercel nur mit `BLOB_READ_WRITE_TOKEN` (AES-verschlüsselter Blob); sonst `/tmp` + E-Mail
- Admin & `/api/*` mit `noindex`
- Keine öffentlichen Links auf `/admin` — nur der Inhaber kennt die Adresse

## Technik

- Next.js 15 (App Router), Tailwind v4
- Repo: `viastefan/Wassana`, Branch `main` → Vercel Production
- Lokale Entwicklung: `npm install && npm run build && npx next start -p 3003`
- CMS-Seiten sind `force-dynamic`, damit Admin-Änderungen sofort sichtbar sind
