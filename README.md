# heidi_spyri

Interaktive Lese- und Lernumgebung zu Johanna Spyris *Heidi*.

## Enthalten

- integrierter Volltext als lokale HTML-Ressource
- 50 Leitfragen aus dem Word-Dokument mit Sofortfeedback
- offene Anmeldung nur mit Name oder Kürzel
- Lehrer*innen-Dashboard ohne Passwortlogik
- didaktisierte Dossiers zu Archiv, Religion, Natur, Stadt-Land, Bildgeschichte, Forschung und Film
- Filmwerkstatt zu Anita Hugis *Heidis Alptraum* als interpretatorische Erweiterung
- GitHub- und Render-fähige Express-App

## Gratis-Hosting

Ja: Das Projekt ist fuer Render Free vorbereitet.

- `render.yaml` nutzt `plan: free`
- Build: `npm ci`
- Start: `npm start`
- Healthcheck: `/`
- keine Lehrer*innen-Passwortlogik

Einschraenkung der Gratis-Loesung: Render Free hat keinen dauerhaft garantierten Dateispeicher. Lernstaende funktionieren im laufenden Unterricht, koennen aber bei Neustart oder Redeploy verloren gehen. Fuer dauerhaft gesicherte Klassendaten braucht es spaeter externes Storage oder einen bezahlten persistenten Datentraeger.

## Start

```bash
npm install
npm test
npm start
```

Standardmäßig läuft die App unter <http://127.0.0.1:3018>.

## Zugänge

- `/open` offene Lernendenansicht
- `/teacher-entry` Lehrendenüberblick
- `/teacher` Dashboard

Die große Open-Access-Studie wurde nicht als 523-MB-Originaldatei eingebettet, sondern als Studienkompass und Dossiers didaktisiert.

Deployment-Schritte stehen in [docs/deployment.md](docs/deployment.md).
