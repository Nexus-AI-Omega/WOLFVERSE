# WOLFVERSE – Systemarchitektur

Created by Nexus-AI-Omega · Architekturstand Foundation 0.1

## 1. Ziel und Geltungsbereich

Ein zusammenhängendes Bedrock-RPG mit gemeinsamer Daten-, Ereignis-, Rechte-, Konfigurations- und Effektbasis. Die große Vision ist ein Produkt-Backlog, **keine Behauptung bereits fertiger Funktionen**. Der erste durchgängige Ausbau enthält Profile, XP/Level, eine Quest, Coins, einen kleinen Shop, Codex und HUD. Füchse haben danach höchste Content-Priorität.

Keine Java-Modloader. Kein Austausch vorhandener Projekte. Kein verpflichtender externer Dienst. Optionales BDS-/KI-Profil bleibt vom lokal/auf Realms geeigneten Kern getrennt.

## 2. Schichten und Verantwortlichkeiten

```text
Bedrock-Ereignisse / Codex / native Forms
                 │ untrusted intent
Runtime Adapter + Eingangsprüfung + Rate Limits + Berechtigungen
                 │ validierter Befehl
Application Services (Quest, Progression, Economy, später Companion …)
                 │ reine Domänenoperation / synchroner Commit
ProfileRepository / WorldRepositories (Schema, Migration, Revision, Limits)
                 │
Bedrock Dynamic Properties / Inventory Adapter
                 │ bestätigtes Ergebnis
Domain Events ────┴──→ HUD / Effects / Statistics / Audit
```

**Domain:** keine `@minecraft`-Imports, keine versteckten Weltzugriffe, deterministisch testbar. **Application:** validiert Identität, Preis, Voraussetzungen und Revision; orchestriert Daten-/Inventaroperationen. **Runtime:** einzige Grenze zu echten Bedrock-Objekten, deren Gültigkeit sich ändern kann. **Presentation:** native Forms; liefert nur Absichten und muss nach jeder asynchronen Antwort erneut validieren.

## 3. Harte Modulregeln

- Profile und Geld nie direkt aus UI-Dateien ändern. Ein zentraler Repository-/Servicepfad ist autoritativ.
- Repository speichert einen begrenzten, validierten Profilblob. Schemafehler/fremde Zukunftsversionen führen zu Sperre/Diagnose, nicht stiller Neuerstellung.
- Revisionsprüfung bei bestätigten Aktionen. Keine `await`-Unterbrechung innerhalb einer synchronen Mutation.
- Eventbus mit expliziten Ereignisnamen, Fehlerisolation und abmeldbaren Listenern; keine beliebigen Textbefehle als Event-Transport.
- Effekte sind Reaktionen auf bereits bestätigte Spielvorgänge. Partikel oder Menütext allein gelten nicht als Skillimplementierung.
- Keine automatische Zirkularabhängigkeit: Services publizieren Fakten, statt untereinander unkontrollierte Callbackketten aufzubauen.
- Welt-/Inventarmutation kann nicht mit Dynamic Properties zu einer ACID-Datenbanktransaktion zusammengefasst werden. Für Käufe gibt es deshalb ein begrenztes Journal, Sperrzustände und konservative Wiederherstellung statt eines falschen Exactly-once-Versprechens.

## 4. Öffentliche Modulverträge

| Vertrag | Eingabe | Ausgabe / Garantien |
|---|---|---|
| `ProfileRepository.read(player)` | Engine-Spielerobjekt | Kopie eines validierten, migrierten Profils; niemals fremde Profile per frei eingegebenem Namen |
| `ProfileRepository.update(player, mutate, expectedRevision?)` | synchrone reine Mutation | validieren → Größenprüfung → ein Profilcommit; Revision steigt; Fehler überschreibt Altdaten nicht |
| `recordKill(profile, fact, now, config?)` | serverseitig erzeugter Kill-Fakt | XP/Questfortschritt nur bei erlaubtem Typ, Modus, Entfernung und Reward-Budget |
| `Quest.claim(profile, questId)` | bekannte Quest-ID | Belohnung und Abschluss im selben Profilblob; Zweitaufruf wirkungslos/abgewiesen |
| `Economy.purchase(player, sku, token)` | serverseitig erzeugter kurzlebiger Einmal-Intent | Preis ausschließlich aus Konfiguration; Coins nie negativ; unklarer Inventarcommit sperrt weitere Käufe |
| `CompanionService` (M1) | Besitzerprofil, Begleiter-ID, Aktion | max. aktive Slots, echte Besitzerprüfung; ungeladene Entity ist nicht automatisch verstorben |
| `DungeonService` (M4) | Gruppen-ID, definierter Eingang | persistente Instanz-ID, reservierter Bereich und eigener Fortschritt; keine echte separate Serverwelt behauptet |
| `AIAdapter` (M7, optional) | minimierter Kontext, erlaubte Anfrageart | begrenztes Text-/Strukturergebnis oder Offline-Fallback; niemals rohe KI-Befehle ausführen |

Alle geplanten Module mit Abhängigkeiten und Testgates: `modules.csv`. Die tatsächlichen 0.1-Exports werden zusätzlich in `api_reference.md` beschrieben.

## 5. Ereignisse

Tatsächlich in 0.1: lokales `profile.changed` mit Engine-Spieler-ID, Vorher-/Nachher-Level und Grund. Geplant, noch nicht publiziert: `profile.ready`, `quest.completed`, `economy.committed`, `economy.quarantined`, `companion.stateChanged`, `combat.resolved`, `boss.phaseChanged`, `dungeon.completed`, `worldEvent.started`.

Payloads sind kleine servererzeugte Werte mit Profil-/Instanz-ID, Ereignis-ID und Schema. Keine Bedrock-Entityobjekte in dauerhafte Daten schreiben. Seiteneffekte erst nach erfolgreichem Commit. Handlerfehler dürfen einen bereits bestätigten Kauf nicht nachträglich automatisch erstatten.

## 6. Persistenz und Lebenszyklus

Player Dynamic Properties für persönliche Daten; später getrennte begrenzte World-Repositories für Clans, Regionen, Shopkonfigurationen und Indizes. Keine unendlich wachsende globale JSON-Datei. Siehe `data_model.md`.

Startup registriert Custom Components; Weltoperationen erst in zulässiger geladener Phase. Pro Spieler begrenzte UI-Sitzung, Einmal-Intents und kurzlebige Guards. Beim Verlassen Sitzungsdaten entfernen. Hintergrundarbeit über zentrale Scheduler-Hüllen mit bekannten Intervallen; keine Welt-Gesamtsuche pro Tick.

## 7. Darstellung

Native `ActionFormData` als kompatibler Anfang; `ModalFormData` erst bei tatsächlichem Bedarf. Dunkles Cyan/Grün, eigene Icons und knappe deutsche Texte; das native Formularlayout wird dadurch nicht frei gestaltbares HTML. Der Kern ersetzt **nicht** das Minecraft-Inventar. Actionbar-HUD ist abschaltbar und kann mit anderen Packs kollidieren; kein stiller globaler JSON-UI-Override.

Hochwertige eigene Modelle, Animationen und Sounds werden pro Content-Meilenstein erstellt und getestet, nicht als tausende leere Dateien vorab angelegt. `resources.csv` trennt geplant von erstellt.

## 8. Plattformprofile

**Core:** zunächst stabile API-2.0-Basis für kleine, überprüfbare Funktionen. Keine Netzwerkmodule, keine Pflicht-Beta-Schalter. **Experimental:** Nutzer hat Preview/Beta erlaubt; jede solche Funktion erhält aber einen eigenen Capability-/Installationshinweis. **BDS-AI:** gesondertes opt-in Integrationspaket/Backend; `server-net` nicht im Core-Manifest und nicht für Realms versprechen.

## 9. Risiken, die kein Architekturdiagramm beseitigt

Universelle Vorab-Manipulation jedes Vanilla-Schadens ist nicht automatisch in der gewählten stabilen API vorhanden. Kein nachträgliches Heilen als angeblich sicherer Ersatz für tödliche Treffer. Exakte RPG-Schadensrechnung zunächst für eigene kontrollierte Angriffe/Zauber oder erst nach separat geprüfter API-Anhebung. Echte native neue Verzauberungstypen, beliebige Inventar-/HUD-Umbauten und echte private Dungeonserver sind ebenfalls keine pauschal zugesagten Core-Fähigkeiten.

Bedrock-Speicherung ist kein manipulationssicherer Tresor gegen Weltbesitzer/Operatoren. Performance wird gemessen; kein allgemeines FPS-Versprechen für jedes iPad.
