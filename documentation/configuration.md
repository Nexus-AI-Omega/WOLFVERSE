# Zentrale Konfiguration

Autoritative Spielwerte: `behavior_pack/scripts/core/configuration.js`. Packidentität und API-Bindung: `project.json` → `tools/create_assets.py` erzeugt die Manifeste. `package-lock.json` fixiert die Entwicklungsabhängigkeiten. Keine Konfiguration wird als Secret-Speicher benutzt.

| Wert | Foundation-Standard | Wirkung |
|---|---|---|
| `maxLevel` | 100 | oberes angezeigtes Level |
| `xpCurveFactor` | 50 | Gesamt-XP für Level L = 50 × L × (L−1); Level 2 bei 100 XP |
| `xpPerKill` | 12 | XP pro zulässigem Reward |
| `hostileTypes` | Zombie/Husk/Drowned/Skeleton/Stray/Spider/Cave Spider/Creeper | geschlossene Liste; keine passiven Tiere/Spieler |
| `killDistance` | 48 | maximale Entfernung beim Death-Fakt |
| `killSpacingMs` | 2000 | Mindestabstand zwischen belohnten Kills pro Profil |
| `killWindowMs`, `maxRewardedKills` | 60000 / 8 | höchstens acht Kill-Rewards pro Fenster; Fenster und Uhrzeit persistent |
| `questTarget` | 3 | drei belohnte Kills, nicht jeder schnelle Farmkill |
| `questXp`, `questCoins` | 75 / 30 | einmalige Einstiegsbelohnung |
| `products.bread` | 1 × `minecraft:bread`, 5 Coins | erster kleiner Inventarshop; Preis nie vom Client |
| `maxCoins`, `maxXp` | je 1.000.000.000 | nichtnegative sichere Integergrenzen |
| `maxProfileBytes` | 8192 | konservatives eigenes UTF-8-Budget, nicht allgemeine Engine-Maximalgröße |
| `maxHistory` | 12 | begrenztes Kaufjournal |
| `intentTtlMs`, `maxIntents` | 30000 / 128 | kurze Bestätigungen; begrenzte flüchtige Intent-Tabelle |
| `hudIntervalTicks` | 20 | höchstens ein Actionbar-Update pro Sekunde bei 20 TPS und Spieler |
| `playtimeFlushTicks` | 1200 | periodisch echte Session-Tickdifferenz speichern; Rest beim Leave kann fehlen |

Die Anti-Farm-Regeln begrenzen schnelle XP-Erzeugung, erkennen aber **nicht zuverlässig jede Spawnerfarm**. Langsames kontrolliertes Töten kann weiterhin zählen. Keine behauptete vollständige Cheat-Erkennung. Ein Rücksprung der Systemuhr setzt das Reward-Budget nicht frei.

## Spielereinstellungen

- `hud=false`: keine regelmäßige WOLFVERSE-Actionbar; beim Umschalten einmal löschen.
- `sound=false`: keine eigenen UI-/Quest-/Level-Sounds.
- `quality=reduced`: Level-up-Partikel unterdrücken; keine versteckten Änderungen an Kampfwerten.
- `theme=green/cyan`: echte Farbänderung in Menütitle/HUD, kein globaler Minecraft-UI-Skin.

## Sichere Änderung

1. Welt und Quellstand sichern.
2. Rein visuelle Einstellungen von Dateninvarianten unterscheiden. `profileKey`, `questId`, Schemagrenzen, Questziel und Pack-UUIDs **nicht** in einer laufenden Welt beiläufig umbenennen/verkleinern.
3. Bei schemawirksamen Änderungen eine deklarierte Migration mit Altprofil-Tests hinzufügen. Bei neuer Quest eigener Catalog-Eintrag/Claim-Schlüssel, kein Zurücksetzen alter Claims.
4. API-Versionen und `min_engine_version` nur nach dokumentierter Memberprüfung erhöhen. Preview-Erlaubnis ist keine automatische API-Verfügbarkeit.
5. `npm run verify`, gegebenenfalls neue BDS-Probe und separate Zielgeräteprüfung ausführen.
6. Neue Packversion bewusst anheben, UUIDs erhalten, bauen und neuen Stand committen/pushen.

Das 0.1-Shop-Adapterprotokoll erlaubt absichtlich nur **ein Stück je Kauf**. Nicht einfach die Menge hochsetzen: Teilmengen und Inventar-Reststacks brauchen erst einen erweiterten, getesteten Journalvertrag.
