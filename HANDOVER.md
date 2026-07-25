# Wassana — Übergabe

Live: https://www.wassana-thai-imbiss.de  
Admin: https://www.wassana-thai-imbiss.de/admin  
(Zugang: Firmenname „Wassanas Thai Imbiss und Feinkost“ tippen)

## Für den Besitzer

1. **Admin-App** unter `/admin` öffnen und Passwort eingeben.
2. Auf dem Handy als App speichern (Android: installieren / iPhone: Teilen → Home-Bildschirm).
3. In der App **Benachrichtigungen erlauben** (Home oder Betrieb) — dann kommen Hinweise zu Kochkursen und News wie bei einer echten App.
4. Unten navigieren:
   - **Kochkurs** — Termin & Texte
   - **Anfragen** — Kontakt-Datenbank (Status, Notizen, Archiv, Löschen)
   - **Banner** — Top-Leiste (Mittagsangebot): Text, Link, Farben
   - **Texte** — Startseite, Zeiten, Schüler-Mittag, Standort
   - **Wochenkarte** — Mo–Fr Gerichte & Preise
   - **Betrieb** — Inhaberdaten, Kontakt, Social, Benachrichtigungen / News senden

## Vercel (einmalig prüfen)

Project **wassana** → Settings → Environment Variables:

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD` | **Pflicht** — Passwort für `/admin` (ohne Default in Production) |
| `ADMIN_SESSION_SECRET` | Optional — separates Cookie-Secret |
| `NEXT_PUBLIC_SITE_URL` | `https://www.wassana-thai-imbiss.de` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | E-Mail-Versand Kontaktformular |
| `CONTACT_TO` | Empfänger (Inhaber-Mail) |
| `BLOB_READ_WRITE_TOKEN` | **Pflicht** — Admin-CMS live auf `.de` (Banner, Texte, Menü, …) |
| `GITHUB_TOKEN` (+ optional `GITHUB_REPO`) | Optional — Backup der CMS-JSONs ins Repo |
| SMTP_* / `CONTACT_TO` | Für Kontaktmails + Admin-Support/Passwort-Reset an `stefandirnberger@viawen.com` |
| `INQUIRIES_SECRET` | Optional — eigener Schlüssel für Anfragen-Verschlüsselung |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search-Console Meta |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push-Benachrichtigungen Admin-App (Public) |
| `VAPID_PRIVATE_KEY` | Push-Benachrichtigungen Admin-App (Private) |
| `VAPID_SUBJECT` | z. B. `mailto:wassanathaiimbiss@icloud.de` |

VAPID-Keys erzeugen: `npx web-push generate-vapid-keys`  
Ohne diese Keys funktionieren lokale Mitteilungen auf dem Gerät; Push bei geschlossener App braucht die Keys auf Vercel.

Nach Änderungen an Env-Variablen: Redeploy.

### Admin → Live Website (wichtig)

Auf Vercel speichert der Admin so:

1. **Vercel Blob** (dauerhaft, sofort live — kein Redeploy nötig)
2. kurz zusätzlich in `/tmp`
3. optional GitHub-Backup, falls `GITHUB_TOKEN` gesetzt ist

`BLOB_READ_WRITE_TOKEN` ist Pflicht für Live-Änderungen (Banner, Texte, Menü, Kochkurs, Betrieb).  
Ohne Blob bleibt nur temporäres `/tmp` — dann ändert sich `.de` nicht zuverlässig.

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
- Kochkurs als `Event` Schema (wenn Termin aktiv)
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

## Technik

- Next.js 15 (App Router), Tailwind v4
- Repo: `viastefan/Wassana`, Branch `main` → Vercel Production
- Lokale Entwicklung: `npm install && npm run build && npx next start -p 3003`
- CMS-Seiten sind `force-dynamic`, damit Admin-Änderungen sofort sichtbar sind
