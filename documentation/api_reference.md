# Tatsächliche Foundation-API 0.1

Die Pfade beziehen sich auf `behavior_pack/scripts/`. Es handelt sich um interne Modulverträge, **nicht um ein offenes HTTP-API**. Geplante Schnittstellen stehen getrennt in [modules.csv](modules.csv).

## Domäne – ohne Minecraft-Imports

- `domain/profile.js`: `newProfile(id, now)`, `decodeProfile(raw, idFactory?, now?)`, `validateProfile(profile)`, `utf8Bytes(text)`, `clone(value)`, `makeId()`, `SCHEMA_VERSION`.
- `domain/progression.js`: `levelFromXp(xp, maxLevel?)`, `xpForLevel(level)`, `rankFromLevel(level)`, `recordKill(profile, fact, now, config?)`, `claimQuest(profile, questId, config?)`.
- `fact = {typeId, survival, distance}` muss vom Runtime-Adapter aus echten Engine-Ereignissen erstellt werden. Ein frei eingegebenes JSON ist **kein Kill-Nachweis**.
- Domänenoperationen mutieren nur die übergebene Arbeitskopie. Alle realen Aufrufer committen über das Repository.

## Repository

`new ProfileRepository({key?, now?, idFactory?})` aus `core/data_manager.js`.

| Methode | Vertrag |
|---|---|
| `read(player)` | validierte Kopie; initialisiert/migriert bekannte Daten; sperrt unbekannte/beschädigte Daten |
| `update(player, mutate, expectedRevision?)` | synchrone Mutation einer Kopie, Reentrancy-/Revisions-/Identitätsschutz, ein geprüfter Profilwrite; neue Kopie zurück |
| `write(player, profile)` | interner Commit-Helfer, nicht als UI-/Admin-Endpunkt verwenden |

`player` ist im echten Adapter das Engine-Spielerobjekt. Testdoubles und die BDS-Entity-Probe implementieren nur dieselbe kleine Dynamic-Property-Schnittstelle; sie beweisen keine reale Spieleranmeldung.

## Spieleraktionen

`new PlayerService(repository, bus)` aus `systems/player_service.js`:

- `recordKill(player, fact, now)` – validierter Faktenpfad, nach Profilcommit `profile.changed`.
- `claimStarterQuest(player, expectedRevision)` – Belohnung plus Claim in einem Profilupdate; Event erst danach.
- `toggleSetting(player, setting, expectedRevision)` – nur `hud`, `sound`, `quality`, `theme`; keine beliebigen Profilpfade.
- `recordDeath(player)`, `addPlayTicks(player, positiveIntegerTicks)`.
- `progressionChange(...)` ist ein interner Orchestrierungshilfe, kein frei erreichbarer Clientbefehl.

Die UI liest Profile, schreibt ihre Felder aber nicht selbst. Dienste prüfen die Aktion erneut nach einer asynchronen Form-Antwort.

## Economy

`new IntentStore(now?, idFactory?)`:

- `issue(profileId, revision, sku)` → kurzlebige ID, Profil-/SKU-/Revisionsbindung.
- `consume(id, profileId, sku)` → gültiger Intent, **einmal**; abgelaufen/fremd/verbraucht wirft Fehler.
- `clearOwner(profileId)` – Sessions beim Verlassen bereinigen.

`new EconomyService(repository, inventoryAdapter, intents?, now?)`:

- `issue(player, sku)` → Intent; kein ungeklärter vorheriger Kauf erlaubt.
- `purchase(player, sku, intentId)` → `{delivered, profile}` oder Fehler; Konfigurationspreis ist autoritativ.
- `resolveFromTrustedServer(player, pendingId, 'confirm'|'refund')` → Profil; **nur hinter dem geprüften Runtime-Server-Ursprungs-Guard aufrufen**. Kein eigener Rechtebypass.

`inventoryAdapter.addOne(player, itemId)` muss synchron genau einen Artikel versuchen: `true` = geliefert, `false` = sicher kein Stück geliefert, Ausnahme = unbekannt. Foundation beschränkt Shopmengen deshalb auf eins. Ein Adapter für größere Mengen bräuchte einen anderen Partial-Delivery-Vertrag.

## Ereignisse und Runtime

`new EventBus(onError?)`, `on(name, listener)` → unsubscribe, `emit(name, payload)` isoliert Listenerfehler. Aktuell tatsächlich verwendet:

```text
profile.changed = { playerId, beforeLevel, afterLevel, reason: 'kill' | 'quest' }
```

Lokaler flacher, gefrorener Faktenpayload; nicht persistent und keine Chat-Nachricht. Spätere `quest.completed`, `economy.committed`, `companion.stateChanged` usw. sind **noch kein implementierter Vertrag**.

- `main.js` registriert `wolfverse:open_codex` im Startup-Event und verschiebt Weltinitialisierung auf `system.run`.
- `initialize()` gibt intern `{openMenu(player)}` zurück.
- `MenuController.open(player)` / `.leave(playerId)` verwaltet maximal eine Form-Sitzung pro Spieler und validiert spätere Antworten gegen Session und Revision.
- `requireServerOrigin(event)` akzeptiert nur Engine-Quelle `Server` ohne Entity/Block/Initiator. Andere installierte Serverskripte sind derselbe Vertrauensbereich, keine isolierten Fremd-Plugins.

## Script-Events

| ID | Herkunft | Verhalten |
|---|---|---|
| `wolfverse:menu` | tatsächliche `sourceEntity` ist Spieler | öffnet nur dessen Menü; keine Zielspieler-/Profil-ID aus Nutztext |
| `wolfverse:status` | nur Server-Ursprung | begrenzter Online-Profil-/Pending-Status in Konsole |
| `wolfverse:resolve_purchase` | nur Server-Ursprung | validiertes Recovery-JSON, höchstens 300 Zeichen; Ziel online |

Es gibt **keinen** frei erreichbaren Coin-Grant, Klassen-/Boss-/Clan-Adminbefehl, HTTP-Endpunkt oder `eval`-Pfad. Normale Spieler brauchen für den Codex keinen Script-Event-Befehl.

## Fehler

`WolfError(code)` und `errorCode(error)` in `core/errors.js`; UI verwendet `friendlyError`. Beispiele: `stale_revision`, `coins_insufficient`, `intent_expired`, `purchase_pending`, `purchase_uncertain`, `profile_future_or_unknown_schema`, `admin_source_required`. Keine automatische „bei Fehler Profil löschen“-Strategie. Fehlercodes sind Diagnose, keine geheimen Berechtigungen.
