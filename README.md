# Wissen über Wiesbaden-Auringen

Wissen über Wiesbaden-Auringen: Vereine, Geschichte, Freizeit, Politik und Orte.

Die Inhalte stammen aus dem **Auringen-Wiki** (`in-wiesbaden-auringen.de`), einem
Confluence-Wiki, das 2017 von Auringer Bürgern und //SEIBERT/MEDIA aufgebaut und
2026 abgeschaltet wurde. Der vollständige Export liegt als Archiv vor; hier steht
die kuratierte Auswahl.

## Herkunft

- Quelle: Confluence-Space `AURINGEN` — 65 Seiten, 145 Anhänge, 446 Versionen
- Übernommen: 21 Seiten, 84 Anhänge
- Nicht übernommen: 24 Seiten Wiki-Betrieb (Anleitungen, Flyer, AVV, FAQ,
  Einladungsvorlagen) und 15 Seiten, die keinen Bestand haben
- Bearbeitungsstand der Inhalte: 2017–2024, nicht aktualisiert

## Was bewusst fehlt

- **Termine, die vorbei sind** (Blutspende 2020, Erste-Hilfe-Kurs 2019,
  vier Weinstände 2019, „Auringen wandert" 2019 und 2024)
- **Vereinsinterna** (Checkliste zur Weinstand-Organisation)
- **Überholte Handlungsanweisungen** (Ukraine-Nothilfe 2022, Sachspendenliste)
- **Leere Seiten** („Zahlen-Daten-Fakten", „Natur und Kulturlandschaft",
  deren Inhalt nur aus Confluence-Plug-ins bestand)
- **Private Daten**: Straßenadressen von Vereinsvorsitzenden wurden entfernt,
  die private Mobilnummer aus der DRK-Einladung ebenso
- **Große Dateien**: der 86-MB-Bericht zum Kreativworkshop und das Foto-ZIP der
  Kita liegen nur im Rettungsarchiv, nicht im Repo

## Struktur

```
src/content/docs/
  index.md                          Wiesbaden-Auringen (Startseite)
  leben-in-auringen/
    freizeit/                       Übersicht, Spielplatz, Wildbret
    vereine/                        Übersicht, Auringer Vereine, TSV, Ferienwohnungen
    politik/                        Übersicht, Wellinger L3028, Gehweg Mühle, Schule
    veranstaltungen/                Übersicht, Weinstand, Lebendiger Adventskalender
  geschichte/                       Übersicht, Ehrenmal 1896, Ehrenmal Gefallene
  zahlen-und-wahlergebnisse/
```

Die Navigation steht in `astro.config.mjs` und ist bewusst explizit, nicht
autogeneriert — die Reihenfolge folgt der Bedeutung, nicht dem Alphabet.

## Entwicklung

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # dist/
```

## Inhaltliche Vorbehalte

- Mehrere Seiten beschreiben Zustände von 2018–2022 (Straßenschäden, Gehweg,
  Schule, Ferienwohnungen) und sind nicht gegen die Gegenwart geprüft.
- „Auringer Vereine" nennt Kontaktdaten von Vereinsfunktionären, wie sie im
  Wiki standen. Adressen sind entfernt, Telefon und E-Mail nicht.
- Die Seite „TSV Auringen" besteht nur aus dem Verweis auf eine Telegram-Gruppe.

## Termine

Die Termine kommen live aus dem
[Auringer Events-Kalender](https://www.auringer-events.de), nicht aus dem Wiki.

Zwei Wege, ein Ergebnis:

1. **Build-Zeit** — `scripts/fetch-events.mjs` holt den öffentlichen ICS-Feed
   (`/calendar.ics`), parst ihn und schreibt `src/data/events.json`. Das läuft
   als `prebuild`, damit die Seiten ohne JavaScript und für Suchmaschinen
   vollständig sind.
2. **Laufzeit** — im Browser holt `EventList.astro` die Live-Liste von
   `/api/public/events` und ersetzt die Anzeige. Der ICS-Feed taugt dafür
   nicht: kein `Access-Control-Allow-Origin`, also von einer anderen Domain
   nicht lesbar. Den JSON-Endpunkt liefert die Events-App
   (`auringer-events`, PR #93).

Fällt `/api/public/events` aus, bleibt der Build-Zeit-Stand stehen.

Die Quelle des Build-Zeit-Abrufs steht in `EVENTS_ICS_URL`: ein `http(s)`-URL
wird geholt, jeder andere Wert als Datei relativ zur Repo-Wurzel gelesen. Der
PR-Build (`.github/workflows/pr-build.yml`) zeigt auf den Fixture
`.github/fixtures/calendar.ics`; `deploy.yml` setzt die Variable nicht und holt
weiter den echten Feed. Die Fixture-Termine liegen bewusst weit in der Zukunft,
damit `upcoming` im Check gefüllt bleibt.

Ist der Feed nicht erreichbar, warnt `fetch-events.mjs` und baut mit einer
vorhandenen `src/data/events.json` weiter, sonst mit leerer Terminliste. Eine
unlesbare Datei-Quelle bricht den Build dagegen ab: sie ist ein Fehler im Repo,
kein fremder Ausfall.

`src/data/events.json` ist gitignored — es entsteht bei jedem Build neu.
