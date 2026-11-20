# Sicherheitsmodell und Vertrauensgrenzen

## Annahmen

Bedrock-Spieler- und Form-Eingaben sind untrusted. Die Welt-/BDS-Betreiber, Packentwickler und andere installierte Serverskripte gehören dagegen zum administrativen Vertrauensbereich. Diese Erweiterung kann keinen Weltbesitzer mit Dateizugriff daran hindern, seinen Spielstand zu ändern.

Nicht im Pack: API-Schlüssel, GitHub-Token, Backend-Konfiguration, HTTP-Clients, `eval` oder aus Freitext zusammengesetzte Befehle. Der Core benötigt kein Netz.

## Tatsächlich vorhandene Schutzmaßnahmen

- Profilzugriff über das tatsächliche Engine-Spielerobjekt; nicht über einen clientseitig eingegebenen Namen.
- Schema-/Integer-/Werte-/Byteprüfung; Zukunfts- und kaputte Daten werden nicht still zurückgesetzt.
- Synchrone Repository-Mutation, unveränderliche Profilidentität, Reentrancy-Guard und Revisionsprüfung nach asynchronem UI.
- Einmal-Intents mit Profil, Revision, SKU und Ablauf; Preise/Mengen ausschließlich aus serverseitigem Katalog.
- Coins nie negativ; ein Kauf erst nach Profilabbuchung, keine automatische Neuauslieferung nach unklarer Inventarmutation.
- Killfakten aus Engine-Events, geschlossene Gegnertypen, Survival, Distanz, Duplicate-Event-Guard und persistentes XP-Zeitbudget.
- Eine UI-Sitzung pro Spieler; Sessionwechsel beim Leave entwertet alte asynchrone Antworten.
- Recovery nur bei Engine-`Server`-Ursprung ohne Source-Entity/Block/Initiator. Andere Serverpacks sind kein sicher isolierter Mandant.
- Begrenzte Fehlerdiagnose: bis zu 64 Fehlercodeschlüssel, gleiche Meldung höchstens einmal je Minute. Keine vollständigen Profile im normalen Fehlerlog.

## Rechte 0.1

Normale Spieler: eigenes Profil lesen, eigene erfüllte Quest abholen, eigenen serverdefinierten Shopkauf bestätigen, eigene Anzeigeoptionen ändern. Keine Coin-Grants, fremden Profile oder Recovery-Aufrufe.

Die **exakten 2.0.0-Typen bieten hier kein verwendetes `isOp`/`playerPermissionLevel`**. Es wird deshalb keine ausgedachte sichere universelle Admin-Form angeboten. Recovery-Konsole ist BDS-orientiert; ein umfassendes abgestuftes Creator-/Adminsystem ist ein späterer Meilenstein mit eigener API-/Rechtematrix. Ein Name oder frei gesetztes Tag ist kein Superusernachweis.

Spieler mit Cheats/Operatorrechten und Dateizugriff sind keine Anti-Cheat-Gegner, gegen die dieses Pack absolute Integrität verspricht. Server-Ursprungsprüfung ist ein Eingangsfilter, keine kryptographische Authentifizierung zwischen installierten Server-Scripts.

## Offene Risiken

- Engine-Inventar und Dynamic Properties sind nicht gemeinsam ACID/disk-durable. Eine Prozess-/Datenträgerkatastrophe kann externe Reconciliation und Weltbackup erfordern.
- XP-Limits verhindern nicht jede langsame Farm und keine administrativ manipulierte Welt.
- Kein echter Zwei-Spieler-/Realm-/Dauerlasttest liegt vor.
- Lokale iOS-Welten/Realms besitzen in 0.1 keinen eingebauten Recovery-Adminweg.
- Das statische Secret-/Import-Musterchecking ist keine vollständige Sicherheitsanalyse.
- Noch keine Cross-Player-Transfers, Banken oder Auktionen; diese werden nicht mit zwei naiven Guthabenwrites nachgerüstet.

## Geplante optionale KI

Separate, opt-in BDS-Anbindung. Kein `server-net` im Core und keine Versprechen für Client/Realm-Netzwerkzugriff. Authentifizierung und Secrets nur im Backend/geschützten BDS-Kontext, TLS, erlaubte Anfragearten, Rate-/Größenlimits, Timeouts, Offline-Fallback und minimierte personenbezogene Daten. Antworten sind untrusted Inhalte; niemals rohe KI-Ausgabe als Spielbefehl/JavaScript ausführen. Vorhandenes WOLF-AI wird ohne eigenen Auftrag nicht destruktiv refaktoriert.

## Meldung/Recovery

Vor jeder manuellen Datenkorrektur Weltkopie und Quellstand sichern. Nur Fehlercode, Buildversion, Host, konkrete Schritte und anonymisierte Transaktions-ID melden; keine Zugangsdaten in Issues/Chat. Private Repository-Berechtigungen regelmäßig prüfen. [Kaufprotokoll](data_model.md) und [Fehlersuche](troubleshooting.md).
