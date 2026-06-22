# Architektur

## Ziel

Dieses Repo liefert eine einzelne, abgeschlossene Unterrichtseinheit zu Johanna Spyris *Heidi*. Es ist fuer GitHub und Render Free vorbereitet.

## Laufzeitmodell

- Express liefert Landingpage, offene Version, SEB-Version und Lehrer*innen-Dashboard.
- Der Reader ist eine Vanilla-JS-Oberflaeche mit integriertem Volltext.
- Klassen, Lernende, Arbeitsstaende und Peer Reviews werden dateibasiert in `data/kehlmann-reader-store.json` gespeichert.
- Auf Render Free ist diese Datei fluechtig. Das ist fuer eine kostenlose Unterrichts- oder Testloesung akzeptabel, aber nicht fuer dauerhafte Archivierung.

## Kernmodule

- `src/app.mjs`: Routing, HTML-Shells und Zugangsseiten
- `src/routes/kehlmann-reader-api.mjs`: Reader- und Lehrer*innen-API
- `src/services/kehlmann-reader-store.mjs`: Persistenz und Klassenlogik
- `src/services/kehlmann-reader-progress.mjs`: Lektions- und Fortschrittsauswertung
- `src/services/kehlmann-reader-feedback.mjs`: differenzierte Feedbackdiagnostik
- `public/kehlmann-reader/data.js`: Heidi-Lektionen, Leitfragen, Dossiers und Medienaufgaben

## Zugangslogik

- `/open`: Name oder Kuerzel
- `/seb`: Safe Exam Browser, dann Name oder Kuerzel
- `/teacher-entry`: offener Lehrpersonen-Ueberblick
- `/teacher`: offenes Lehrer*innen-Dashboard

## Kostenfreie Deployment-Strategie

Render Free hostet den Node-Server. GitHub hostet den Code.

## Erweiterungspfad

- externes Storage fuer dauerhaft gesicherte Klassendaten
- feinere Review-Rubriken
- Exportfunktionen fuer Lehrkraefte
- weitere Medien- und Forschungsstationen
