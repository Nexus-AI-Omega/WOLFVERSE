# Reproduzierbare Prüfungen und ehrliche Evidenz

## Kategorien

| Kategorie | Ausführung / Aussage |
|---|---|
| Node Domäne/Services | echte JS-Funktionen; XP-Grenzen, Migration, fehlerhafte Daten, Quest, Kaufprotokoll, Revisionsschutz, simulierte Speicher-/Inventarfehler |
| Node Runtime-/UI-Simulation | produktiver Adapter/Controller mit **ausdrücklich benannten Testdoubles**; Startup, Join/Leave, Menüabsichten, Einstellungen, Adminablehnung; kein echtes Minecraft-UI |
| API-Typprüfung | `checkJs` gegen exakt installierte 2.0.0-Server/UI-Definitionen; verhindert unbelegte Memberverwendung; `strict:false` ist kein vollständiger formaler Typbeweis |
| Python Pack/Build | Manifest-/Import-/Asset-/Namespace-/Musterprüfungen, gezielte defekte Fixtures, deterministisches ZIP, keine Tests/Dependencies im Spielpaket |
| Echter BDS | zwei offizielle 1.26.66.1-Prozesse, unveränderte Pack-UUIDs, Startup/Custom-Item, echte Entity-Dynamic-Properties und Chest-Container, World-Property über sauberen Neustart |
| Gerät/Realm/echte Spieler/Performance | **offen**; Checkliste separat |

Aktuelle maschinenlesbare Resultate: [verification.json](../test-results/verification.json), [pack-validation.json](../test-results/pack-validation.json), [bds-verification.json](../test-results/bds-verification.json). Die Reports enthalten SHA-256-Werte der dabei geprüften Packdateien. Nach Änderungen müssen Checks erneut ausgeführt werden; alte Logs sind kein Beweis für neuen Code.

## Lokale Suite

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

`tools/verify.py` führt Node-Tests, API-Typprüfung, Python-Tests, statische Packprüfung und Build aus. Nicht jede Voraussetzung ist gleich stark: Die statische Prüfung ist projektspezifisch, **keine vollständige Konformitätszertifizierung aller offiziellen Bedrock-Schemas**. PNG-Header und Dateiverweise ersetzen keinen GPU-/Soundtest.

Fehler werden nicht als bestanden umgedeutet. [Beim ersten BDS-Lauf gefundene Korrekturen](../test-results/bds-known-fixes.md) bleiben dokumentiert.

## Opt-in BDS-Probe

Nur in einer **frisch entpackten, entbehrlichen offiziellen BDS-Kopie**, niemals auf dem produktiven Server. Die EULA des Anbieters selbst beachten. Linux-Systembibliotheken müssen vorhanden sein. BDS wird nicht ins Repo kopiert.

```sh
python3 tools/bds_probe.py \
  --server-dir /ABSOLUTER/PFAD/ZUR/ENTBEHRLICHEN/BDS_KOPIE \
  --acknowledge-disposable-server
```

Dieses Tool:

- überschreibt QA-`server.properties` und leere Allowlist in genau dieser Kopie;
- erzeugt ausschließlich die eindeutig benannte entbehrliche Welt `WOLFVERSE_QA_DISPOSABLE` und eigene `wolfverse_qa`-Staging-Packs;
- lässt `online-mode=true`, `allow-list=true`, Allowlist leer, LAN-Werbung aus;
- staged einen **zusätzlichen Test-only-Scriptimport**, der im Release nicht enthalten ist;
- startet zweimal nacheinander, schickt Konsolenproben, stoppt ordentlich und speichert kleine bereinigte Logs;
- prüft World-DP-Speicherung über **sauberen Neustart**, nicht über Stromausfall/Datenträgerverlust.

## Was die BDS-Proben konkret beweisen

1. Core und registrierte Custom Component starten auf diesem offiziellen Runtime-Build ohne erfassten Script-/Contentfehler.
2. `wolfverse:codex` lässt sich als echter `ItemStack` erzeugen. Dies beweist noch keinen Touch-Use-Callback.
3. Klassische Forms binden und konstruieren sich. **Kein `.show(player)` ohne echten Spieler**, also kein Darstellungstest.
4. Das Repository kann an einer echten Engine-Entity Profile anlegen und lesen; Quest und Kaufservice laufen damit gegen reale Dynamic Properties.
5. Ein echter Chest-Container bekommt ein Brot; doppelte Bestätigung wird abgelehnt; voller Container bucht zurück.
6. ID/Typ/Location eines normalen getöteten Zombies sind im tatsächlichen Death-Event lesbar.
7. Ein World-Dynamic-Property bleibt mit denselben Pack-UUIDs über Stop/Start erhalten.

**Nicht bewiesen:** echtes Player-Property-Verhalten bei Rejoin, Attribution eines echten Spieler-/Pfeilkills, Realm, Touch, Rendering, Audio, Multiplayerkonflikte, harte Crash-Durability, Mindest-Engine 1.21.90 oder FPS. Diese Unterscheidung ist Teil der Abnahme, kein Kleingedrucktes.

## Release-Gates

Foundation ist ein Entwicklungsbuild. Eine Gerätefreigabe verlangt ausgefüllte [device_checklist.md](device_checklist.md). M1 verlangt zusätzlich zwei reale Spieler, Chunkentladung und Fuchs-Neustartfälle. Kein späterer Meilenstein wird allein durch weitere Node-Testzahlen als fertig markiert.
