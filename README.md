# Wassana Thai Imbiss

Website für Wassanas Thai Imbiss und Feinkost in Landshut — nach Website-Konzept mit Speisekarte, Catering, Kochkurs und Impressum.

## Farbschema

Weiß · Gold · Dunkelrot

## Seiten

- `/` Startseite mit Begrüßung und Speisekarte
- `/speisekarte` Speisekarte & beliebte Gerichte der Woche
- `/catering` Catering mit E-Mail-Kontakt
- `/kochkurs` Kochkurs mit E-Mail-Kontakt
- `/kontakt` Kontakt
- `/impressum` Impressum und Social-Media-Links
- `/admin` Passwort-geschützt: **Site Manager** — Verwaltungsprogramm des Inhabers

## Site Manager (`/admin`)

Verwaltungsprogramm des Inhabers, im Browser. Vier Bereiche:
**Speisekarte**, **Angebote**, **Anfragen**, **Betrieb** (inkl. Öffnungszeiten).

Damit Änderungen auf der Website erscheinen, braucht das Vercel-Projekt einen
Blob-Store (Storage → Create Database → Blob → dem Projekt zuweisen, dann
Redeploy). Der Zugang `BLOB_READ_WRITE_TOKEN` wird dabei automatisch gesetzt.
Fehlt der Speicher, sagt das Programm es selbst und zeigt die zwei Schritte an.

Das Passwort steht in der Umgebungsvariable `ADMIN_PASSWORD` (in Production
ohne Standardwert). Welcher Kunde bedient wird, steht in `src/cms/config.ts` —
beim nächsten Projekt wird nur diese Datei angepasst.

## Entwicklung

```bash
npm install
npm run dev
```

## Deploy

Vercel-Projekt: `festag/wassana-43cb`
