# M1 – zuverlässiger Fuchs-Vertical-Slice (noch nicht implementiert)

Priorität direkt nach der Foundation. In 0.1 existieren absichtlich **kein Fuchs-Entity, keine Fuchs-Assets und kein toter Begleiter-Button**.

## Befund zur Vanilla-Basis

Die archivierte offizielle `minecraft:fox`-Definition enthält Trust-/Trusted-Defense-Verhalten, aber in der untersuchten Komponenteninventur keine fertige Kombination aus `minecraft:tameable` und `minecraft:behavior.follow_owner`. Das ist keine Wolf-artige vollständige Besitzerverwaltung. Der Befund wird in `research/fox-component-inventory.json` mit Quellhash reproduzierbar festgehalten; keine Behauptung eines hier ausgeführten Vanilla-Fox-Lebenszyklustests.

M1 nutzt eine **eigene namensräumige Entity**, kein globales Überschreiben von `minecraft:fox`. Tameable/Follow-Owner-Komponenten können an einer eigenen Entity geprüft werden; das Engine-Taming allein ersetzt aber nicht die persistente WOLFVERSE-Besitzer-/Generationsprüfung. Eigene Geometrie/Texturen/Animationen, soweit erstellt; Vanilla-Assetrechte nicht pauschal als MIT umetikettieren.

## Minimaler Vertrag

- Genau ein Fuchsdatensatz und höchstens ein aktiver Slot pro Profil im ersten Slice.
- `summon(player)`, `dismiss(player)`, `setMode(player,'follow'|'wait')`, `recall(player)`, `rename(player,validatedName)`.
- Identität: `companionId`, `ownerProfileId`, Schema, Revision, Generation/Lease, Entity-ID, Modus, bekannte letzte Dimension/Position.
- Namen begrenzt, Steuerzeichen/Formatcodes entfernen; kein Name als Besitzerbeweis.
- Keine beliebige Entity-ID aus dem Client übernehmen. Serverseitig aus dem besitzenden Profil und validiertem Datensatz auflösen.
- Eine ungeladene Entity (`world.getEntity` nicht auflösbar) ist **nicht automatisch tot**.

## Vorgesehene Zustandsmaschine

```text
STORED → SPAWN_PENDING → ACTIVE_FOLLOW ⇄ ACTIVE_WAIT
                          │       │
                          └→ SUSPENDED_UNLOADED
                          │       └→ RECONCILE → derselbe gültige Lease
                          └→ DEAD_CONFIRMED / DISMISSED
```

Profil-/Weltdaten und Entityspawn sind wiederum nicht atomar. Deshalb vor Spawn einen begrenzten Lease/Journaleintrag speichern; Entity mit Companion-ID/Owner/Generation markieren; nach dem Spawn erst bestätigen. Bei unklarem Ergebnis nicht blind erneut spawnen. Ältere Generationen müssen beim Laden erkannt und kontrolliert deaktiviert/entfernt werden, bevor sie weiter als gültige Begleiter agieren.

Die genauen Engine-Event-/Tickgrenzen dieser Reconciliation sind **erst zu testen**. Auch ein Lease ist kein magischer Exactly-once-Beweis für jeden Crash. Ein fehlender geladener Handle rechtfertigt keine zweite aktive Entity. Kein periodisches Laden der gesamten Welt und kein stilles Erzeugen unbegrenzter Ticking Areas.

## Bewegungs- und Rückrufregeln

Eigene Vanilla-kompatible Navigations-/Follow-Bausteine bevorzugen. Warten stoppt folgen tatsächlich, nicht nur den Statusnamen. Rückruf prüft Besitzer, gleiche erlaubte Dimension, sichere begehbare Zielposition und Cooldown. Kein Teleport in Blöcke, Lava oder aus fremden Instanzen. Bei nicht sicher auflösbarer Entity zunächst Zustand anzeigen/sperren, nicht duplizieren.

Erste Verhaltenslogik ist deterministisch/regelorientiert und begrenzt getaktet. Persönlichkeiten/Skills/Evolution verändern später konkrete Entscheidungen/Stats – keine angeblich selbstlernende KI durch zufällige Texte.

## Abnahme

1. Zwei tatsächliche Spieler: Beschwören/Umbenennen/Warten/Rückruf/Entlassen nur für den jeweiligen Besitzer.
2. Folgen durch normale Wege; Warten stabil; sicherer Rückruf; Tod-/Wiederbeschwörungsregeln eindeutig.
3. Chunkentladung, Dimensionswechsel, Besitzerlogout, Serverneustart und unterbrochener Spawn jeweils ohne doppelten gültigen Begleiter.
4. Unklare Lease-/Entityzustände erkennbar und begrenzt wiederherstellbar, kein stiller Reset.
5. Originalmodell/Idle/Walk/Run/Wait-Animation/Textur/Audio vollständig eingebunden und auf iPad/Windows tatsächlich angesehen.
6. Erst danach XP/Level, fünf Persönlichkeiten, Frost/Shadow/Flame/Mystic/Ancient/Royal und fünf Entwicklungsstufen ausbauen.

Keine Umsetzung dieser Abnahme wird durch die M0-Node- oder Chest-Container-Tests behauptet.
