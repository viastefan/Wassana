# Wassana — Übergabe

Live: https://www.wassana-thai-imbiss.de  
Admin: https://www.wassana-thai-imbiss.de/admin  
(Zugang: Firmenname „Wassanas Thai Imbiss und Feinkost“ tippen)

## Für den Besitzer

1. **Admin-App** unter `/admin` öffnen und Passwort eingeben.
2. Auf dem Handy als App speichern (Android: installieren / iPhone: Teilen → Home-Bildschirm).
3. Unten navigieren:
   - **Kochkurs** — Termin & Texte
   - **Anfragen** — Nachrichten aus Formularen
   - **Texte** — Startseite, Zeiten, Schüler-Mittag, Standort
   - **Wochenkarte** — Mo–Fr Gerichte & Preise

## Vercel (einmalig prüfen)

Project **wassana** → Settings → Environment Variables:

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.wassana-thai-imbiss.de` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | E-Mail-Versand Kontaktformular |
| `CONTACT_TO` | Empfänger (Inhaber-Mail) |
| `GITHUB_TOKEN` (+ optional `GITHUB_REPO`) | Dauerhafte Speicherung von Admin-Änderungen |

Nach Änderungen an Env-Variablen: Redeploy.

## Rechtliches / Cookies

- Cookie-Banner mit Links zu Datenschutz & Impressum
- Google Maps erst nach Zustimmung
- Footer-Link **Cookies** öffnet den Hinweis erneut

## Technik

- Next.js 15 (App Router), Tailwind v4
- Repo: `viastefan/Wassana`, Branch `main` → Vercel Production
- Lokale Entwicklung: `npm install && npm run build && npx next start -p 3003`
