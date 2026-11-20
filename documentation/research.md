# Technikrecherche und belastbare Grenzen

Recherchebasis ist die bereits gesicherte **Bedrock-Referenzsammlung mit Stichtag 12.11.2026** außerhalb dieses Projekts. Sie wird nicht verdoppelt. Aktuelle Web-/npm-/Runtimebelege sind kleine neue `research/`-Dateien. Ein Dokumentationsstichtag ist keine Erkennung der installierten Nutzerversion.

## Primärquellen und Umsetzung

| Quelle | Tatsächlicher Befund / Konsequenz |
|---|---|
| [Script API Versioning](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/versioning?view=minecraft-bedrock-stable) und [V2 overview](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/v2-overview?view=minecraft-bedrock-stable) | Manifest/API/Engine getrennt; Startup-/Early-Execution beachten; Weltinit verzögern |
| [npm server 2.0.0](https://registry.npmjs.org/@minecraft%2Fserver/2.0.0), [server-ui 2.0.0](https://registry.npmjs.org/@minecraft%2Fserver-ui/2.0.0) | Metadaten gespeichert, anschließend tatsächlich exakte Pakete installiert und Typprüfung ausgeführt; MIT-Deklaration; Lockfile enthält Integritäten |
| Exakt installierte `index.d.ts` | `startup`, ItemComponentRegistry/`onUse`, Dynamic Properties, EntityDie, Forms, `isValid`-Property vorhanden; keine Verwendung neuer ungepinnter Permission-Member |
| [ItemCustomComponent](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/itemcustomcomponent?view=minecraft-bedrock-stable) | `onUse` für registrierte Komponente; `onReleaseUse` ist auf der abgerufenen Stable-Ansichtsseite ausdrücklich prerelease – nicht unbesehen verwenden |
| [interact_button](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_interact_button?view=minecraft-bedrock-stable) | Touch-Button als boolean/string; eigener Codex erhält echte Use-Komponente und Beschriftung; Touchwirkung dennoch Zielgerätetest |
| Offizielle Vanilla-Foxdefinition aus dem fixierten Mojang-Sample-Stand | Trust/Trusted-Defense, keine in der Inventur fertige Tameable-/Follow-Owner-Basis; eigener Fox-Vertical-Slice erforderlich |
| [Server-Net reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-net/minecraft-server-net?view=minecraft-bedrock-stable) | BDS-Kontext, nicht normale Clients/Realms; keine Netzwerkmittel im Core |
| [26.63 Hotfix](https://feedback.minecraft.net/hc/en-us/articles/50306516691853-Minecraft-Bedrock-Edition-26-63-Hotfix-Changelog) | Artikel nennt Windows/Servers/PS5; daraus keine neueste iOS-Version ableiten |
| [Offizieller BDS-Download](https://www.minecraft.net/en-us/download/server/bedrock) | gelieferter Linux-Link `1.26.66.1` tatsächlich heruntergeladen, HTTPS-Content-MD5/ZIP geprüft und isoliert gestartet |

### Verifizierte Dateien

- `research/server-package.json`, `server-ui-package.json`: ursprüngliche exakte npm-Metadaten inklusive Dist-Integrität.
- `package-lock.json`: tatsächlich aufgelöste vollständige Entwicklungsabhängigkeiten, nicht nur ein Versionswunsch.
- `research/api-types.json`: lokale Typdatei-Hashes und ausgewählte tatsächliche Memberprüfungen.
- `research/fox-component-inventory.json`: unveränderter Quellhash und Komponentennamen; **Inventur, kein Fuchsspieltest**.
- `research/bds-download.json`: offizieller URL, Größe, lokal ermittelter SHA-256, HTTPS-Content-MD5/ZIP-Befund.
- `test-results/bds-verification.json`: tatsächlich gestartete Runtimeversion, SHA des Executables, Proben, Grenzen und geprüfte Packdateien.
- `research/original-assets.json`: Herkunft der selbst erzeugten Foundation-Assets.

BDS-Binärdateien, npm-Pakete, die vollständige Wissenssammlung und deren fremde Assets sind **nicht im WOLFVERSE-Repository**. Die archivierten Dokumente haben gemischte Stable/Beta-Beispiele; nur ein `view=stable`-URL oder ein altes Sample-Manifest beweist keine konkrete Member-/Realm-Unterstützung.

## Nicht ungeprüft zugesagte Fähigkeiten

- Universelles präventives Canceln jedes Vanilla-Schadens wird in API 2.0 nicht vorausgesetzt. M2 beginnt mit kontrollierten eigenen Angriffen oder hebt die Baseline nach eigener Prüfung bewusst an.
- Dynamische/native neue Enchantment-Typen, beliebig freie Forms/Inventarersatz und echte private Dungeonserver werden nicht als bestehende Core-Features bezeichnet.
- Neuere JSON-Dimensionstutorials beschreiben u.a. Void-Dimensionen, nicht automatisch vollständiges neues Terrain oder universelle Realm-Unterstützung.
- Komprimierte PNG-Größe ist nicht Grafikspeicher; die Packprüfung protokolliert eine einfache RGBA-Dimensionsschätzung, keine GPU-Messung.
- `setDynamicProperty` plus Inventarmutation ist keine gemeinsame ACID-/Festplatten-Transaktion.
- Ein Headless-BDS mit null Spielern ist kein iPad-/Player-Rejoin-/Realm-/FPS-Test.

## Entscheidungen

[ADR 0001](adr/0001-foundation.md): kleine stabile Foundation, native UI, conservative persistence, Fox first, optionale KI getrennt. Jede spätere experimentelle Funktion erhält eigene Capability-/Installations-/Testnachweise. Preview-Erlaubnis erlaubt Forschung, nicht ungekennzeichnete Beta-Abhängigkeiten.
