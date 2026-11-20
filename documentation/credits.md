# Credits, Herkunft und Lizenzen

**WOLFVERSE – BEYOND MINECRAFT**  
**Created by Nexus-AI-Omega**

## Originale Projektinhalte

Foundation-Spielcode, Dokumentation, Branding-Vektor, Pixelicons/Codex/Spark und die drei kurzen synthetisierten Töne wurden für dieses Projekt erzeugt. Reproduktionsquelle der kleinen Medien: `tools/create_assets.py`; Ressourcenstatus: [resources.csv](resources.csv). Es gibt noch keine eigenen Fuchs-/Boss-/Waffenmodelle und keine echten In-Game-Screenshots.

Für das private Projekt ist noch **keine öffentliche Lizenz ausgewählt**; siehe [LICENSE.md](../LICENSE.md). Die Privatstellung eines Repositorys ist kein Ersatz für Rechteprüfung fremder Inhalte.

## Nur Entwicklungsabhängigkeiten

| Paket | aufgelöste Version | deklarierte Lizenz |
|---|---|---|
| `@minecraft/server` | 2.0.0 | MIT |
| `@minecraft/server-ui` | 2.0.0 | MIT |
| `@minecraft/common` | 1.1.0 | MIT |
| `@minecraft/vanilla-data` | siehe Lockfile (aktuell 1.26.60) | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |

Diese Pakete werden **nicht** in das `.mcaddon` oder als `node_modules` ins Repository eingebettet. Die echte Bedrock-Runtime stellt ihre Scriptmodule bereit. Für optionale Asset-Neugenerierung separat installierte Pillow/numpy/soundfile-Abhängigkeiten behalten ihre jeweiligen Upstream-Lizenzen; auch sie werden nicht als Bibliothekscode mitgeliefert.

## Minecraft und Forschungsquellen

Minecraft, Bedrock Dedicated Server und Marken gehören Mojang/Microsoft bzw. den jeweiligen Rechteinhabern. Der offizielle BDS wurde ausschließlich als lokales Testwerkzeug aus dem offiziellen Download bezogen, nicht umverteilt. EULA und Nutzungsrichtlinien des Anbieters bleiben maßgeblich.

Offizielle Minecraft-Creator-Dokumentation und Samples wurden recherchiert. Die externe Wissenssammlung dokumentiert deren getrennte Lizenzen. Besonders wichtig: **Mojang/bedrock-samples ist nicht pauschal MIT**; Modelle/Texturen daraus sind nicht automatisch frei umlizenzierbare eigene Assets. Die Foundation verteilt keine aus dieser Sammlung kopierten Medien.

Der Shop referenziert die im Basisspiel vorhandene Brot-Iconadresse; das Minecraft-Originalbild wird nicht kopiert oder eigenständig weiterlizenziert. Neue Ressourcen müssen pro Asset Herkunft, erlaubte Nutzung, Änderungen und erforderliche Namensnennung erfassen. Community-Webseiten sind keine automatische Assetlizenz.

Nicht offiziell mit Mojang oder Microsoft verbunden; keine offizielle Partnerschaft behauptet.
