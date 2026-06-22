# Architektur

## Ziel

Dieses Repo liefert eine einzelne, abgeschlossene Unterrichtseinheit zu Johanna Spyris *Heidi*. Es ist für GitHub, Vercel und Render vorbereitet.

## Laufzeitmodell

- Express liefert Landingpage, offene Version, SEB-Version und Lehrer*innen-Dashboard.
- Der Reader ist eine Vanilla-JS-Oberfläche mit integriertem Volltext.
- Lernende melden sich nur mit Namen an; alle Lektionen sind verfügbar und sollen absolviert werden.
- Namen, Lernstände, Antworten und Peer Reviews werden bevorzugt in Supabase gespeichert, wenn `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` gesetzt sind.
- Ohne Supabase nutzt die App den lokalen Fallback `data/kehlmann-reader-store.json`.

## Kernmodule

- `src/app.mjs`: Routing, HTML-Shells und Zugangsseiten
- `src/routes/kehlmann-reader-api.mjs`: Reader- und Lehrer*innen-API
- `src/services/kehlmann-reader-store.mjs`: Persistenz, Supabase-Adapter und automatische Hintergrundgruppe
- `src/services/kehlmann-reader-progress.mjs`: Lektions- und Fortschrittsauswertung
- `src/services/kehlmann-reader-feedback.mjs`: differenzierte Feedbackdiagnostik
- `public/kehlmann-reader/data.js`: Heidi-Lektionen, Leitfragen, Dossiers und Medienaufgaben

## Zugangslogik

- `/open`: Name
- `/seb`: Safe Exam Browser, dann Name
- `/teacher-entry`: offener Lehrpersonen-Überblick
- `/teacher`: offenes Lehrer*innen-Dashboard

## Kostenfreie Deployment-Strategie

Vercel Hobby hostet den Serverless-Express-Einstieg, Supabase Free speichert die Lernstände. Render Free bleibt als einfachere, aber flüchtigere Alternative erhalten.

## Erweiterungspfad

- externe Backups für dauerhaft gesicherte Lernstände
- feinere Review-Rubriken
- Exportfunktionen für Lehrkräfte
- weitere Medien- und Forschungsstationen
