# Wassana Thai Imbiss

Website für Wassanas Thai Imbiss und Feinkost in Landshut — nach Website-Konzept mit Speisekarte, Catering, Kochkurs und Impressum.

## Farbschema

Weiß · Gold · Dunkelrot

## Seiten

- `/` Startseite mit Begrüßung und Speisekarte
- `/speisekarte` Speisekarte & Wochenkarte
- `/catering` Catering mit E-Mail-Kontakt
- `/kochkurs` Kochkurs mit E-Mail-Kontakt
- `/kontakt` Kontakt
- `/impressum` Impressum und Social-Media-Links
- `/admin` Passwort-geschützt: nächsten Kochkurs-Termin eintragen (Widget unten rechts)

## Kochkurs-Admin

1. Öffne `/admin`
2. Passwort = Umgebungsvariable `ADMIN_PASSWORD` (lokal Standard: `wassana`)
3. Datum/Titel speichern → Hinweis erscheint unten rechts auf der Website

In Vercel unter Environment Variables `ADMIN_PASSWORD` setzen. Optional `GITHUB_TOKEN` + `GITHUB_REPO`, damit Speichern den Termin dauerhaft ins Repo schreibt.

## Entwicklung

```bash
npm install
npm run dev
```

## Deploy

Vercel-Projekt: `festag/wassana-43cb`
