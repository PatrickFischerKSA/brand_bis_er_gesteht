# Gratis-Deployment

## Empfohlene Gratis-Loesung

Die App ist fuer Render Free vorbereitet. Das ist die passende Gratis-Loesung, weil die Lernumgebung einen kleinen Node/Express-Server braucht:

- `/open` fuer Lernende
- `/teacher-entry` fuer die Lehrpersonen-Uebersicht
- `/teacher` fuer das Dashboard
- `/reader-api` fuer Lernstaende, Peer Review und Sofortfeedback

GitHub Pages reicht dafuer nicht aus, weil dort keine Serverrouten laufen.

## Render Free

Die Datei `render.yaml` ist bereits fertig eingerichtet:

- `plan: free`
- `buildCommand: npm ci`
- `startCommand: npm start`
- `healthCheckPath: /`
- `HOST=0.0.0.0`

Vorgehen:

1. Projekt als GitHub-Repository hochladen.
2. Bei Render einen neuen `Blueprint` aus dem Repository anlegen.
3. Render erkennt `render.yaml` automatisch.
4. Deploy starten.
5. Nach dem Deploy diese Routen testen:
   - `/`
   - `/open`
   - `/teacher-entry`
   - `/teacher`

## Kosten

Diese Variante kostet nichts.

Wichtig: Render Free hat keinen dauerhaft garantierten Dateispeicher. Die App funktioniert im Unterricht, aber gespeicherte Lernstaende koennen bei Neustart, Redeploy oder Free-Instanz-Wechsel verloren gehen. Fuer eine Unterrichtseinheit, Testphase oder kurze Sequenz ist das in Ordnung. Fuer dauerhaft archivierte Klassendaten braucht es spaeter externes Storage oder einen bezahlten persistenten Datentraeger.

## Ohne Passwortlogik

Das Lehrer*innen-Dashboard ist bewusst offen gehalten:

- kein `TEACHER_DASHBOARD_PASSWORD`
- kein komplizierter Login
- direkte Nutzung von `/teacher-entry` und `/teacher`

## Optionale SEB-Absicherung

Optional kann in Render `SEB_CONFIG_KEY_HASH` gesetzt werden. Ohne diese Variable bleibt die SEB-Erkennung einfacher und die offene Version funktioniert trotzdem.

## Laufzeitdaten

Die App erzeugt `data/kehlmann-reader-store.json` beim ersten Start automatisch. Diese Datei ist in `.gitignore` ausgeschlossen und gehoert nicht ins GitHub-Repository.
