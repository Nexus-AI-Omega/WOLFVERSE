# Datenmodell, Migration und Wiederherstellung

## Tatsächliches Profil 0.1 / Schema 2

Ein Player Dynamic Property `wolfverse:profile`, JSON-String, höchstens **8192 UTF-8-Bytes**. Der Engine-Datentyp ist nicht die Sicherheitsprüfung: JSON, Root-Felder, Identität, sichere Integer, Grenzen, Quest-/Journal-Zusammenhänge und Einstellungen werden zusätzlich validiert.

| Feld | Inhalt / Grenze |
|---|---|
| `schemaVersion` | `2`; unbekannte Versionen werden gesperrt |
| `profileId` | einmal erzeugte UUID-v4-förmige Projekt-ID; kein Name und kein Passwort |
| `revision`, `createdAt` | nichtnegative sichere Integer; bei normalem Update unveränderliche Identität/Zeit, Revision +1 |
| `xp`, `coins` | Integer 0…1.000.000.000 |
| `stats` | `monsterKills`, `deaths`, `playTicks`; simulierte Ticks, keine reale Uhrzeit |
| `quest` | bekannte ID `first_watch_v1`, Fortschritt 0…3, `claimed` boolean |
| `settings` | `hud`, `sound`; `quality: standard/reduced`; `theme: cyan/green` |
| `rewards` | persistentes Zeitfenster, letzter Reward-Zeitpunkt, Zahl belohnter Kills |
| `pendingPurchase` | `null` oder Transaktions-ID, SKU, gebuchter Preis und Startzeit |
| `history` | höchstens 12 Kaufabschlüsse; IDs eindeutig; `debited/delivered/refunded` |

Level/Rang werden aus XP berechnet und nicht redundant gespeichert. Namen, API-Schlüssel, IP-Adressen, Bedrock-Objekte und beliebige UI-Texte gehören nicht in dieses Profil.

`monsterKills` zählt erlaubte Survival-Kills in Reichweite auch dann, wenn das Reward-Limit weitere XP verhindert. Nur **belohnte** Kills treiben die Einstiegsquest weiter. `playTicks` wird aus tatsächlich seit dem letzten Flush vergangenen Session-Ticks berechnet; beim Verlassen/Abbruch können bis zu 1199 noch ungeflushte Ticks fehlen. Es wird kein voller Minutenblock für neu beigetretene Spieler erfunden.

## Eigentum

Eigentum folgt dem echten Engine-Spielerobjekt und dessen Dynamic Properties, nicht einem frei übergebenen Spielernamen. Die zufällige Profil-ID ist ein Korrelationsschlüssel für spätere Begleiter/Clans. `Math.random`-basierte IDs sind **keine kryptographischen Zugangstoken**. Ein Spieler erhält dadurch keinerlei Adminrecht. Engine-ID und Anzeigename sind keine garantierte externe XUID-Identität.

Pack-Header-UUIDs in `project.json`/Manifesten **über Updates behalten**. Dynamic Properties haben einen Packkontext. UUID-Wechsel, Packentfernung oder Weltumzug dürfen nicht als sichere Datenmigration missverstanden werden. Vor Updates vollständige Weltkopie anlegen.

## Lese-/Schreibvertrag

1. Fehlender Property-Wert: neues Schema-2-Profil erzeugen und validieren.
2. Vorhandener String: schon vor JSON-Parsing Bytebudget prüfen; dann Schema und Inhalt prüfen.
3. Gültige bekannte Altversion: deklarierte Migration auf einer neuen Kopie, erneut prüfen, erst dann zurückschreiben.
4. Ungültige Daten/Zukunftsversion: Fehler zurückgeben und **Altdaten nicht überschreiben**. Kein automatischer Reset.
5. Update: Reentrancy-Guard je Engine-Spieler-ID → lesen → optional Revision prüfen → synchrone Domänenmutation → Identität/Revision/Schema/Bytes prüfen → ein `setDynamicProperty`-Aufruf.

Keine `await`-Mutation und keine Inventar-/Weltseiteneffekte innerhalb des Repository-Callbacks. Rückgaben sind Kopien. Ein erfolgreicher API-Schreibaufruf ist **keine garantierte unmittelbare Festplatten-Flush-/ACID-Zusage** der Bedrock-Engine.

## Migration 1 → 2

Schema 1 ist ein **expliziter synthetischer Migrationsvertrag für Tests**, kein bereits an Spieler ausgeliefertes WOLFVERSE-Release. Deklariert: `schemaVersion`, optional `profileId`/`createdAt`, `xp`, `coins`, optional `questKills`/`hud`. Werte gehen in das neue Profil über; neue Stats/Settings/Journal werden definiert initialisiert. Fehlerhafte Werte werden verworfen im Sinne von **Migration abgebrochen**, nicht auf null zurückgesetzt.

Neue reale Releases brauchen eigene schrittweise Migrationen und Kopien echter anonymisierter Altprofile als Regressionstest. Eine Migration darf behauptete Belohnungen nicht erneut freigeben. Keine generische „unbekanntes Schema einfach als neu behandeln“-Abkürzung.

## Kaufprotokoll 0.1

Nur ein Stück pro Vorgang. Der Client wählt eine bekannte SKU, niemals Preis, Stückzahl oder Guthaben. Ein kurzlebiger serverseitiger Intent bindet Profil, Revision und SKU. Verbrauch entfernt den Intent auch bei ungültigem Folgeversuch.

```text
Kein Pending
  → bestätigten Intent prüfen
  → Coins abbuchen + pendingPurchase + debited-Journal in EINEM Profilwrite
  → einmal Container.addItem(1 Stück)
       bestätigt geliefert → Journal delivered + Pending löschen
       bestätigt voll      → Coins zurück + refunded + Pending löschen
       Ausnahme/unklar     → Pending BEHALTEN, weitere Käufe sperren
```

Zwischen Inventar und Profil gibt es **keine gemeinsame Engine-Transaktion**. Der Server/Client kann an jeder Grenze abbrechen; sogar API-bestätigte Änderungen können bei einem Prozess-/Datenträgerfehler unterschiedlich gespeichert sein. Deshalb kein pauschales Exactly-once-/Rollback-Versprechen.

- Niemals bei unbekanntem Status automatisch erneut ausliefern oder erstatten.
- Ein Inventarfehler nach tatsächlicher Lieferung darf nicht gratis einen zweiten Artikel erzeugen.
- Die Speicherung der Belohnung und des Quest-Claim-Flags erfolgt dagegen im selben Profilblob; in dessen gewöhnlichem Updatepfad ist ein zweiter Claim abgewiesen.

### Geprüfte manuelle Kaufauflösung

Nur aus **vertrauenswürdigem Server-Script-Event-Ursprung**; nicht aus Spieler-/Block-/NPC-Events. Ziel muss online sein. Erst die tatsächliche Lieferung prüfen und Welt sichern.

BDS-Konsole, **ohne führenden Slash**:

```text
scriptevent wolfverse:status
scriptevent wolfverse:resolve_purchase {"profileId":"DIE_TATSAECHLICHE_PROFIL_ID","id":"DIE_TATSAECHLICHE_PENDING_ID","resolution":"confirm"}
```

`confirm` bestätigt eine bereits erfolgte Lieferung und erzeugt keinen Gegenstand. `refund` nur nach bestätigter Nichtlieferung; erstattet den gespeicherten Preis, ohne Gegenstand zu erzeugen. Dies sind verständlich gekennzeichnete Eingabeplätze in einer Anleitung, keine automatisch ausgeführten IDs. Nach Auflösung ist ein zweiter Auflösungsversuch abgewiesen. Audit nennt Aktion und Transaktions-ID, keine ganzen Profile.

Lokale iOS-Welten/Realms haben keinen vergleichbaren BDS-Konsolenzugang. In 0.1 gibt es dort **noch keinen eingebauten Recovery-Admin-Dialog**. Bei einem gesperrten Kauf nicht das Profil löschen; gesicherte Welt gezielt untersuchen bzw. ein separat geprüftes Recovery-Release verwenden.

## Spätere Datenräume – noch nicht implementiert

Getrennte begrenzte World-Repositories für Begleiter-Leases, Clans, Partys/Instanzen, Shopkataloge, Regionreservierungen und mehrteilige Ledger. Jeder Datensatz erhält Schema, ID, Revision und bekannte Limits. Indizes werden paginiert; keine unendlich wachsende globale JSON-Datei. Cross-Player-Transfers, Item-Escrow und Auktionen benötigen ein eigenes Journal/Reconciliation-Protokoll, nicht zwei ungesicherte Guthabenänderungen.
