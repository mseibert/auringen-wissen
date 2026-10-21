# Auringen Wissen

Wissen über Wiesbaden-Auringen: Vereine, Geschichte, Freizeit, Politik und Orte.

Die Inhalte stammen aus dem **Auringen-Wiki** (`in-wiesbaden-auringen.de`), einem
Confluence-Wiki, das 2017 von Auringer Bürgern und //SEIBERT/MEDIA aufgebaut und
2026 abgeschaltet wurde. Der vollständige Export liegt als Archiv vor; hier steht
die Auswahl, die öffentlich weiterleben soll.

## Herkunft und Umfang

- Quelle: Confluence-Space `AURINGEN`, 65 Seiten, 145 Anhänge, 446 Versionen
- Übernommen: 41 Seiten, 109 Anhänge
- Nicht übernommen: 24 Seiten Wiki-Betrieb (Anleitungen, Flyer, AVV, FAQ,
  Einladungsvorlagen) — für eine statische Seite ohne Funktion
- Bearbeitungsstand der Inhalte: 2017–2024, nicht aktualisiert

## Struktur

```
src/content/docs/
  index.md                                  Wiesbaden-Auringen (Startseite)
  geschichte-von-wiesbaden-auringen/
  leben-in-wiesbaden-auringen/
    freizeit-in-wiesbaden-auringen/
    organisationen-vereine-unternehmen-und-personen-in-wiesbaden-auringen/
    politik-in-wiesbaden-auringen/
    termine-in-wiesbaden-auringen/
  zahlen-daten-fakten/
```

## Entwicklung

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # dist/
```

## Inhaltliche Vorbehalte

- Mehrere Seiten sind zeitgebunden (Weinstände 2019, Sitzungen des Ortsbeirats,
  Ukraine-Hilfe 2022) und als Chronik zu lesen, nicht als aktuelle Information.
- „Termine in Wiesbaden-Auringen" und „Zahlen-Daten-Fakten" hatten im Original
  keinen Text (Confluence-Plug-in bzw. leer).
- Auf „Die Natur und Kulturlandschaft" fehlt der Name des Ansprechpartners: das
  Personen-Makro war nur angemeldeten Nutzern zugänglich.
- Der große Bericht zum Kreativworkshop (86 MB) und das Foto-ZIP der Kita sind
  nicht im Repo; beide liegen im Rettungsarchiv.
