# brand_bis_er_gesteht

Interaktive Lese- und Lerneinheit zu Christine Brands *Bis er gesteht* als literarische Spurensicherung.

## Enthalten

- integriertes PDF als lokale Reader-Ressource
- sechs Fallphasen mit Fokusfragen, Sofortfeedback und Parcours-Export
- Detektiv-Rahmen: Spuren sichern, Tathergang rekonstruieren, Motive prüfen, Prozess führen
- Urteilswerkstatt mit konkurrierenden Urteilsvarianten auf derselben Aktenbasis
- reales Urteil des Bezirksgerichts Horgen als zentrale Gerichtsakte
- Rechtsprechungsressourcen zu StGB, StPO, Bundesgericht und Zürcher Entscheidsuche
- Vertiefung zu Verteidigungsrechten, EMRK, psychiatrischer Exploration, Schuldfähigkeit und Massnahmenindikation
- Materialstationen zu Fallrekonstruktion, True-Crime-Ethik, Erzähltechnik, Verhör, Sprache und Raum
- Autorinnenstation zu Christine Brands Website
- Podcaststation zu *Unter Verdacht - Der Zwillingsmord von Horgen (2/3)*
- Craft-Ressourcen als externer Materialpool
- Dropbox-Hörbuchordner als Hörstation
- offene Anmeldung nur mit Name
- Lehrer*innen-Dashboard ohne Passwortlogik
- GitHub-, Vercel- und Render-fähige Express-App
- empfohlener Gratisbetrieb: Vercel Hobby + GitHub-Dateistore für persistente Lernstände ohne schlafenden Server

## Start

```bash
npm install
npm test
npm start
```

Standardmässig läuft die App unter <http://127.0.0.1:3024>.

## Zugänge

- `/open` offene Lernendenansicht
- `/teacher-entry` Lehrendenüberblick
- `/teacher` Dashboard

Die Einheit arbeitet bewusst mit einer True-Crime- und Prozessethik: genaue Analyse, keine Ausschmückung realer Gewalt, klare Trennung von Textbeobachtung, Indiz, Zusatzmaterial, Vermutung und Urteil.

Für Deployment ohne schlafenden Server siehe [docs/deployment.md](docs/deployment.md).
