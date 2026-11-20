# Entwicklerleitfaden

## Projektgrenzen

Eigenständiges Bedrock-Projekt, keine Kopie der großen Wissensbibliothek und kein destruktiver Umbau von WOLF-AI. Alle Spielskripte sind direkt ausführbare ESM-`.js`; `tsc --allowJs --checkJs` prüft gegen exakt gepinnte offizielle Typdefinitionen. Tests haben ausdrücklich benannte Simulationsmodule statt vorgetäuschter Minecraft-Runtimes.

```text
behavior_pack/    Manifest, Item, Rezept, scripts/{core,domain,systems,ui}
resource_pack/    Manifest, eigene Texturen/Icons, Particle, Sounds, Lokalisierung
assets/           Branding (keine falschen In-Game-Screenshots)
documentation/    Verträge, Grenzen, Backlog und Abnahmelisten
research/         kleine Herkunfts-/API-/Runtimebelege, keine kopierte Bibliothek
tests/            Node Domain/Services/Runtime-Simulation, Python, BDS-only Probe
tools/            statische Prüfung, Build, lokale Suite, opt-in BDS-Probe
artifacts/        kleiner nachvollziehbarer Entwicklungsbuild
test-results/     tatsächlich ausgeführte kleine Logs und Resultate
```

## Einrichtung und Befehle

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run typecheck
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm run validate
npm run build
npm run verify
```

Node 20.6+ und Python 3.10+. TypeScript wird lokal über npm installiert. `package-lock.json` gehört ins Repository, `node_modules/` nicht. Keine Lifecycle-Scripts externer Pakete ausführen. Der Spielcore selbst hat keine npm-/Internet-Laufzeitabhängigkeit; Bedrock liefert die Manifestmodule.

Die Builddatei enthält zwei `.mcpack`-Archive mit Manifest im jeweiligen ZIP-Root. Doppelte Builds aus identischen vorhandenen Packdateien sind bytegleich. Vorhandene Originalassets sind bereits eingecheckt. Optionaler Assetgenerator: `python3 tools/create_assets.py`; er benötigt Pillow, numpy und soundfile. Äquivalente Audio-Neugenerierung kann je Bibliotheks-/Ogg-Version anders serialisierte Bytes erzeugen; danach alle Hash-/BDS-Belege erneuern. Die UUIDs aus vorhandenem `project.json` werden dabei erhalten.

## Ein neues System hinzufügen

1. Backlog und Capability-/Hostannahmen festhalten. Erforderliche APIs gegen **die tatsächlich gepinnte Version** prüfen.
2. Reine Domänenoperation schreiben und mit deterministischen Rand-/Fehlerfällen testen.
3. Repositoryschema nur mit deklarierter Migration erweitern; alte Claims/Coins/Ownership erhalten.
4. Application Service mit validierten Inputs, Berechtigungen, Revision und Limits bauen.
5. Engineadapter verarbeitet echte Ereignisse; keine Client-JSONs als Kill-/Lootnachweis akzeptieren.
6. UI erst anbieten, wenn die Aktion funktioniert. Nach `await form.show` Session/Entity/Revision erneut prüfen.
7. Ressourcen nur mit eigener/gekannter Herkunft; Modell/Animation/Audio/Verhalten gemeinsam abnehmen.
8. Suite und passende Engine-/Geräteproben ausführen, Berichte aktualisieren, changeloggen, committen/pushen.

Dienste rufen nicht beliebig andere Dienste zyklisch auf. Fakten nach Commit über den lokalen Eventbus; Fehler eines Effektlisteners macht keinen bereits bestätigten Kauf rückgängig. Keine langfristig gespeicherten Engineobjekte.

## Änderungen prüfen

`tools/validate.py` ist bewusst klein/projektspezifisch, kein vollständiger Parser aller zukünftigen Bedrock-Formate. Beim Erweitern neue echte Validierung/Tests hinzufügen, nicht die Prüfung einfach abschalten. `.d.ts`, Testproben, Abhängigkeiten, Serverbinaries und Welten gelangen nicht in das `.mcaddon`.

`tests/bds_probe.js` wird nur in eine entbehrliche Staging-Kopie importiert. Releasepack und BDS-Probe sind deshalb nicht byteidentische Scriptentrys; Report benennt genau diese Testinstrumentierung. Die eigentlichen Coredateien bleiben dabei unverändert kopiert. [Testgrenzen](testing.md).

## Versionierung/Backup

Neue kleine sinnvolle Meilenstein-Commits statt „tausend Dateien = Fortschritt“. Private Remote-Sichtbarkeit vor dem ersten Push prüfen. Keine Tokens in Remote-URLs, Committext, `.env`, Packkonfiguration oder Logs. Zugang nur über offizielle kurzlebig lokal gespeicherte Anmeldung; temporäre Credentials danach entfernen.

Die Quelle ist ein Git-Projekt; Minecraft-Spielstände sind separate Daten. Es gibt keinen dauerhaften automatischen Push-Dienst. Vor einem Update/Recovery vollständiges Weltbackup erstellen. Alte Projekte und fremde Repositories nicht miträumen oder überschreiben.
