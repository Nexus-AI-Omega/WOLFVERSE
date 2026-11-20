# Technologie- und Kompatibilitätsprüfung

Stand: Foundation 0.1. Tatsächliche Minecraft-Version des Nutzergeräts noch **nicht angegeben**. Preview/Beta wurde ausdrücklich erlaubt; daraus folgt keine automatisch installierte Preview-Version.

## Gewählte Foundation-Basis

- Bedrock BP/RP, Manifestformat 2; feste Pack-UUIDs über Updates erhalten.
- Mindest-Engine zunächst `[1,21,90]`, Itemformat `1.21.90`.
- Exakte Script-Bindungen `@minecraft/server 2.0.0`, `@minecraft/server-ui 2.0.0`.
- Bewusste unterstützte 2.x-Baseline statt unbelegt der höchsten gerade sichtbaren Dokumentationsnummer. Verwendete Member werden gegen die **2.0.0-Typdefinitionen** geprüft.
- Core benötigt keine Beta-API-/Preview-Schalter. Ein späterer experimenteller Ausbau bekommt ein getrenntes, ausdrücklich dokumentiertes Profil.
- Kein `server-net`, `server-admin`, Editor-Modul oder Java-Code im Kern.

Die API-Version ist nicht dieselbe Zahl wie die Spielversion. Höhere stabile 2.x-Minorversionen sollen nach Modulversionierung rückwärtskompatibel sein; tatsächliche Geräte-/Packkompatibilität bleibt zu testen. Mindestversion ist keine Behauptung eines hier ausgeführten Tests auf 1.21.90.

## Aktueller Quellenbefund

Der archivierte Vanilla-Sample-Stand nennt `1.26.60.5`. Die offizielle Hotfixseite vom **11.11.2026** nennt **26.63 für Windows, Servers und PlayStation 5**; daraus wird **keine neueste iOS-Version** abgeleitet. Die offizielle BDS-Downloadseite lieferte zum Abruf einen Link auf `1.26.66.1`. Spielanzeige, interner Build und Serverpaket werden getrennt protokolliert.

Creator-Hauptzweige und `view=stable`-URLs enthalten teilweise auch spätere oder experimentelle Member. Alte Sample-Manifeste kombinieren teils ein altes `min_engine_version`-Feld mit neuer API. Diese Beispiele werden nicht blind kopiert.

## Capability-Matrix

| Bereich | Foundation-Entscheidung | Grenze / spätere Prüfung |
|---|---|---|
| Profile / XP / Coins | Dynamic Properties, normale Serverlogik | Limits, Migration, Rejoin, World-UUID-Kontext |
| Menüs | klassische Script Forms | native Layouts, kein frei ersetztes Inventar |
| HUD | abschaltbare Actionbar | Konflikte mit anderen Packs möglich |
| Codex | Custom Item + registrierte Komponente; Touch-Interact-Button | echte iPad-Bedienung bleibt Gerätetest |
| Füchse | eigenes `wolfverse:`-Entity-Konzept | Vanilla Trust ist nicht fertiges Taming/Follow Owner; kein globaler Fox-Override |
| Schaden/Attribute | für M2 Capability-Gate | keine universelle Before-Hurt-Cancellation in der 2.0-Basis voraussetzen |
| DDUI / neue Grafik | nicht im Foundation-Core | konkrete Klasse/API/Hardware und Experimente prüfen |
| Biome / neue Dimensionen | späterer eigener Vertical Slice | JSON-Void-Dimensionen sind in neueren Referenzen beschrieben; nicht automatisch volle Terrain-/Realm-Unterstützung |
| KI / HTTP | optionales BDS-Profil | `server-net` funktioniert nicht im normalen Client und nicht auf Realms |
| Adminrechte | nur tatsächlich angebotene Engine-Berechtigung oder streng geprüfter Server-Ursprung | keine bloßen frei setzbaren Namens-/Taglisten als Superuserbeweis |

## Prüfmatrix – nicht pauschal grün markieren

| Umgebung | Nachweis |
|---|---|
| Node-Domänen-/Service-/Runtime-Simulationen | tatsächlich ausgeführt; aktuelles Ergebnis und Packhashes in `test-results/verification.json` |
| JSON/Pack/API-Typprüfung | tatsächlich ausgeführt; `test-results/verification.json` / `pack-validation.json` |
| Offizieller BDS | 1.26.66.1; zwei Starts, null Spieler, Entity-DP/Chest-Container/World-Neustartprobe; `test-results/bds-verification.json` |
| iPad/iPhone Import, Touch, UI, Grafik, Ton | **offen**, bis Nutzer-/Gerätetest vorliegt |
| Realm / zwei echte Spieler | **offen** |
| Dauerleistung / FPS / alle alten Bedrock-Versionen | **offen** |

## Primärquellen

- https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/versioning?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/v2-overview?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_interact_button?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/itemcustomcomponent?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-net/minecraft-server-net?view=minecraft-bedrock-stable
- https://feedback.minecraft.net/hc/en-us/articles/50306516691853-Minecraft-Bedrock-Edition-26-63-Hotfix-Changelog
- https://www.minecraft.net/en-us/download/server/bedrock

Quellrevisionen und weitere Einschränkungen: `research.md`.
