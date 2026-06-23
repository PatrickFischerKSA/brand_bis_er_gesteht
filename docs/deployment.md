# Gratis-Deployment ohne schlafenden Server

## Empfehlung

Für diese Einheit ist die stabilste kostenlose Architektur:

1. **Vercel Hobby** für Hosting und Serverless Express
2. **GitHub-Dateistore** für Lernstände, Antworten, Klassen und Peer Reviews

Warum nicht Render Free: Free Web Services schlafen ein, und lokale Laufzeitdaten sind flüchtig.

Warum nicht Supabase Free als Primärlösung: Supabase Free ist bequem, kann aber bei Inaktivität pausieren. Das widerspricht der Vorgabe "kein Einschlafen".

## Zielbild

- Die App läuft auf Vercel Hobby.
- Vercel hat keinen dauerhaft laufenden Server, der schlafen gehen kann.
- Jede Antwort wird serverseitig per GitHub API in eine JSON-Datei geschrieben.
- Die Daten liegen versioniert in einem GitHub-Repo.
- Bei Redeploys oder Serverless-Neustarts gehen keine Lernstände verloren.

## GitHub Store Einrichten

1. Ein privates oder öffentliches GitHub-Repo für die Daten anlegen.
   - Empfehlung: eigenes privates Repo, z. B. `brand-reader-data`.
2. In diesem Repo muss noch keine Datei existieren. Die App erstellt sie beim ersten Zugriff.
3. Einen GitHub Fine-grained Personal Access Token erstellen.
   - Repository access: nur das Datenrepo
   - Permissions: `Contents: Read and write`
4. In Vercel diese Environment Variables setzen:
   - `GITHUB_STORE_TOKEN`: der GitHub Token
   - `GITHUB_STORE_REPO`: `owner/repo`, z. B. `patrickfischer/brand-reader-data`
   - `GITHUB_STORE_BRANCH`: meist `main`
   - `GITHUB_STORE_PATH`: z. B. `data/brand-bis-er-gesteht-reader-store.json`
   - optional `GITHUB_STORE_COMMITTER_NAME`
   - optional `GITHUB_STORE_COMMITTER_EMAIL`

Der Token bleibt serverseitig in Vercel und wird nicht an den Browser ausgeliefert.

## Vercel Einrichten

Die Datei `vercel.json` ist bereits enthalten. Sie leitet alle Routen an `api/index.mjs` weiter:

- `/`
- `/open`
- `/teacher-entry`
- `/teacher`
- `/reader-api`
- `/reader/assets/...`

Vorgehen:

1. Repository in Vercel importieren.
2. Framework Preset: `Other`.
3. Build Command: leer lassen oder `npm ci`.
4. Output Directory: leer lassen.
5. GitHub-Store-Variablen setzen.
6. Deploy starten.

## Fallbacks

### Supabase

Supabase wird weiterhin unterstützt, wenn diese Variablen gesetzt sind:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `SUPABASE_STORE_TABLE=reader_store`
- optional `SUPABASE_STORE_ID=brand_bis_er_gesteht`

Das ist praktisch, aber für die harte Vorgabe "kein Einschlafen" nicht die bevorzugte Gratislösung.

### Lokaler Store

Ohne GitHub- oder Supabase-Variablen nutzt die App lokal:

`data/kehlmann-reader-store.json`

Das ist nur für Entwicklung gedacht.

## Wichtige Grenze

Kostenlos und absolut garantiert gibt es nicht. Die GitHub-Store-Variante ist aber für dieses Unterrichtsszenario die beste Gratislösung: kein schlafender Render-Server, kein pausierendes Supabase-Projekt, persistente versionierte Daten.
