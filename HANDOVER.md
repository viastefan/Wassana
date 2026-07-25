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
   - **Anfragen** — Nachrichten aus Formularen
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
| `GITHUB_TOKEN` (+ optional `GITHUB_REPO`) | Dauerhafte CMS-Speicherung (Texte/Menü/Kochkurs) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search-Console Meta |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push-Benachrichtigungen Admin-App (Public) |
| `VAPID_PRIVATE_KEY` | Push-Benachrichtigungen Admin-App (Private) |
| `VAPID_SUBJECT` | z. B. `mailto:wassanathaiimbiss@icloud.de` |

VAPID-Keys erzeugen: `npx web-push generate-vapid-keys`  
Ohne diese Keys funktionieren lokale Mitteilungen auf dem Gerät; Push bei geschlossener App braucht die Keys auf Vercel.

Nach Änderungen an Env-Variablen: Redeploy.

## Rechtliches / Cookies

- Cookie-Banner mit Links zu Datenschutz & Impressum
- Google Maps erst nach Zustimmung
- Footer-Link **Cookies** öffnet den Hinweis erneut

## Google / SEO / SEA live schalten

1. [Google Search Console](https://search.google.com/search-console) → Property für `https://www.wassana-thai-imbiss.de`
2. Eigentum bestätigen (DNS-TXT bei IONOS oder HTML-Meta):
   - Meta: Variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel setzen
3. Sitemap einreichen: `https://www.wassana-thai-imbiss.de/sitemap.xml`
4. URL-Prüfung → wichtige Seiten „Indexierung beantragen“ (Start, Speisekarte, Kontakt)
5. Optional Bing Webmaster Tools mit derselben Sitemap
6. **Google Business Profile** mit Website + Adresse verknüpfen — entscheidend für lokale SEA/Maps

Technisch vorbereitet: Canonicals (nur www), Open Graph, JSON-LD (LocalBusiness), Sitemap, Robots, Security-Header, HSTS, Safari-Icons.

## Sicherheit (kurz)

- Security-Header + CSP + HSTS
- Scanner-Pfade blockiert (`wp-admin`, `.env`, …)
- Rate-Limits auf Kontakt & Admin-Login
- Origin-Check auf mutierenden APIs
- Kein Default-Admin-Passwort in Production
- Kontakt-Anfragen (PII) werden **nicht** ins GitHub-Repo geschrieben
- Admin & `/api/*` mit `noindex`

## Technik

- Next.js 15 (App Router), Tailwind v4
- Repo: `viastefan/Wassana`, Branch `main` → Vercel Production
- Lokale Entwicklung: `npm install && npm run build && npx next start -p 3003`
- CMS-Seiten sind `force-dynamic`, damit Admin-Änderungen sofort sichtbar sind
