# Zusammenhängender Funktions-Backlog

**Nur M0-Foundation ist implementiert. Alles nachfolgend als „geplant“ markierte ist Design/Backlog, kein aktiviertes Menü oder fertiges Spielsystem.** Technische Verträge/Abhängigkeiten stehen in [modules.csv](modules.csv), die Reihenfolge in [roadmap.md](roadmap.md).

## Kern und RPG

M0: Initialisierung, Konfiguration, Engine-Eventadapter, Fehlercodes, Profile, kleines Eventsystem, XP/Level/Ränge, eine Quest, Coins-Shop und native UI. Geplant: paginierte Welt-Repositories, umfassende Creatorrechte, Fortschritts-/Leistungsdiagnose und eine Capability-Registry pro Plattform.

Geplante RPG-Erweiterung: Klasse/Spezialisierung, Skills/Attribute, Spielstatistiken, Quests/Dungeons, mehrere Salden, Erfolge und Ausrüstung. Neun Attribute bekommen **erst dann eine sichtbare Anzeige, wenn ihre Wirkung implementiert ist**:

| Attribut | geplante nachzuweisende Wirkung |
|---|---|
| Stärke | zusätzlicher kontrollierter Angriffsschaden |
| Verteidigung | geprüfte Schadensreduktion in unterstützter Damage-Pipeline; keine falsche nachträgliche Unsterblichkeit |
| Geschwindigkeit | begrenzte wirkliche Bewegungseffekte mit Rücknahme beim Ausrüsten/Logout |
| Ausdauer | tatsächliche Kosten/Regeneration für definierte Aktionen |
| Magie | Zauberskalierung und Mana-/Ressourcenvertrag |
| Kritchance | serverseitiger zulässiger Wurf, gedeckelte Wahrscheinlichkeit |
| Kritschaden | zusätzlicher Schaden ausschließlich auf bestätigtem Krit |
| Regeneration | gemessene Heilung im erlaubten Takt, keine toten Spieler wiederbeleben |
| Glück | definierte begrenzte Loot-/Belohnungswirkung, nicht nur Tooltip |

## Klassen und Skilltrees – geplant M2

| Klasse | Spezialisierung | erster Skill-Vertical-Slice |
|---|---|---|
| Krieger | Berserker | zeitbegrenzter kontrollierter Kampfrausch mit Kosten/Cooldown |
| Magier | Arkaner Sturm | begrenzter Flächenzauber mit Ziel-/Teamprüfung |
| Assassine | Schattenlauf | kontrollierte Mobilität mit Kollisions-/Teleportprüfung |
| Paladin | Göttlicher Schild | getesteter Schutz/Healpfad ohne unbelegte Vanilla-Pre-Hurt-Annahme |
| Bogenschütze | Pfeilhagel | begrenzte Projektile/Ziele, keine unkontrollierte Entitylawine |

Eigene Symbole, Beschreibungen, Skill-VFX/Audio, Aufstiege und echte Ausrüstungsboni. Bäume: Kampf, Verteidigung, Magie, Überleben, Erkundung, Begleiter und besondere Fähigkeiten. Knoten besitzen Voraussetzungen, Kosten, Cooldowns, Upgrades und Refund-Regeln.

## Fuchsbegleiter – M1 zuerst, Ausbau danach

Ein zuverlässiger eigener Fuchs vor vielen Varianten. Besitz über Profil-ID, Beschwören/Entlassen/Folgen/Warten/Rückruf/Namen, Rejoin und Entladebehandlung. Dann XP/Level, Skills, Seltenheit, Persönlichkeiten **treu, neugierig, mutig, verspielt, wachsam**, fünf Entwicklungsstufen und **Frost, Shadow, Flame, Mystic, Ancient, Royal**. Regelbasierte begrenzte Entscheidungen statt unbelegter selbstlernender KI. [Technischer M1-Vertrag](fox_m1.md).

## Kreaturen, Bosse und Dungeons – geplant M3/M4/M8

Friedliche, neutrale, feindliche und Elite-Kreaturen jeweils mit vollständigem Verhalten, Spawnregeln, Gesundheit/Attributen, Modell, Textur, Animation, Audio, Loot, Seltenheit und Lore. Keine bloße Namensliste als Implementierung.

Wiederverwendbarer Bossrahmen: Begegnungs-ID, Teilnehmer, Schwierigkeit, Spawn-/Wiederholungsregeln, Phasen, begrenzte Angriffe, UI und validierte Rewards. Zuerst **VOID KING mit vier tatsächlich unterschiedlichen Phasen**. Danach Ancient Dragon, Frost Titan, Shadow Emperor, Crystal Overlord, Corrupted Guardian, Abyss Monarch.

Dungeon-Vertical-Slice: Eingang/Schlüssel, reservierter Bereich/Instanz-ID, Räume, ein Rätsel, Fallen, Wellen, Subboss/Boss, Timer/Schwierigkeit, Rewardchest und Ranking. Partys erhalten getrennte synchronisierte Fortschritte. Reservierte Regionen sind **keine echten privaten Serverwelten**. Neustart, Tod, Timeout und Gruppenaustritt gehören zum Design, nicht erst zum Bugfix.

## Quests, Magie, Ausrüstung – geplant M2/M3/M5

Questtypen: Kill, Sammlung, Erkundung, Boss, Dungeon, Lieferung, Überleben und Events. Ketten, Daily/Weekly-Epochen, Geheimnisse, Historie und Dialoge. Abgabe-/Inventarvorgänge brauchen denselben konservativen Journalansatz wie Käufe.

Magiefamilien: Feuer, Wasser, Eis, Blitz, Natur, Schatten, Licht, Void und Kristall. Jede Fähigkeit braucht Kosten/Cooldown, Ziel-/Entfernungsprüfung, wirkliche Effekte, Upgrades und sparsame VFX/Audio.

Waffen/Rüstung/Materialien, Seltenheiten **Common → Uncommon → Rare → Epic → Legendary → Mythic → Ancient**, eigene 3D-Assets, Sets, Schmieden, Upgrade/Reparatur. Erstes Beispiel **Voidblade / Void Slash**, erst als fertig annoncieren, wenn Schaden/Kosten/Cooldown und Modellintegration stimmen. Neue native Verzauberungstypen werden nicht ohne API-Beleg versprochen.

## Wirtschaft und Mehrspieler – geplant M6

Coins, Gems, Event Tokens, Dungeon Tokens. Transfers, NPC-/Spielershops, Auktionen, Banken, Verlauf und Administration. Echte Mehrdatensatz-Journale, Escrow und Reconciliation vor einem Transfer-Button.

Clans: Ränge/Rechte, Bank, Chat, Level, Erfolge und Ranking. Partys/Teams als eigene sichere Mitgliedschaftsmodelle. Handel, Arenen, Bounties und Events mit Schutz gegen Selbstfarmen, stale Einladungen und mehrfaches Settlement.

## Welt und Präsentation – geplant M5/M8

Biome/Strukturen/Ruinen/Wälder/Höhlen/Tempel/Dungeons/Entdeckungen. Neue Dimensionen und Terrain nur mit gesonderter Versions-/Realm-Prüfung; keine Welt wird ungefragt umgebaut.

Events: **Blood Moon, Dragon Invasion, Treasure Hunt, Ancient Awakening**. Persistente Epochen, Start/Stop-/Neustartverhalten und begrenzte Spawns/Effekte.

Ein gemeinsamer Codex/HUD für später Profil, Skills, Journal, Begleiter, Wirtschaft, Clans, Dungeonbrowser, Einstellungen und Admin. Die Foundation zeigt nur die vier funktionierenden Bereiche. Inventarerweiterung statt falschem Vanilla-Inventarersatz. Einheitlicher Ressourcen-/Animations-/Soundstil und echte Zielgerätetests.

## Creator und optionale KI – geplant M6/M7

Validierte Werkzeuge für Profile/Ränge/Währungen, Quests, Shops, NPCs, Bosse/Events/Dungeons sowie Logs/Status. Rechteprüfung pro Operation, keine Freitext-Codeausführung.

Wolf-AI ist **optional und getrennt**. Offline-Core bleibt vollständig spielbar; BDS-Netzwerkadapter mit Backend-Auth, Timeouts, Limits und privatsparsamer Diagnose. Keine Schlüssel im BP/RP, keine behauptete HTTP-Unterstützung auf Realm/iPad. Bestehendes WOLF-AI bleibt erhalten.
