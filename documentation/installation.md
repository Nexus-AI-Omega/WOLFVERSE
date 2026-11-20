# Installation und Updates

## Voraussetzungen

Minecraft **Bedrock**, nicht Java. Foundation: Manifest 2, Engine-Untergrenze 1.21.90, stabile `@minecraft/server 2.0.0`/`server-ui 2.0.0`. Diese Zahlen sind nicht miteinander oder mit der sichtbaren Spielanzeige gleichzusetzen. Tatsächlich ausgeführter Headless-Test: BDS 1.26.66.1. Nutzergerät-Version weiterhin unbekannt.

Der Core braucht keine Preview/Beta-Experimente. Preview ist ausdrücklich erlaubt, aber nicht allein deswegen verpflichtend. Keine Java-Modloader, kein Forge/Fabric und kein obligatorischer externer Server/KI-Dienst.

## iPad/iPhone oder Windows-Client

1. Eine **neue Testwelt oder Weltkopie** verwenden. Originalwelt unangetastet sichern.
2. `artifacts/WOLFVERSE-Foundation-0.1.0.mcaddon` herunterladen. Es enthält zwei echte `.mcpack`-Archive, kein Video/keine Beispielwelt.
3. In der Dateien-App/Explorer mit Minecraft öffnen bzw. an Minecraft teilen. Auf erfolgreichen Import beider Packs achten. iOS-Import/Touch wurden hier nicht real getestet.
4. In der Welt das **WOLFVERSE BP** und **WOLFVERSE RP** aktivieren; wenn die BP-Abhängigkeit das RP automatisch ergänzt, trotzdem beide prüfen.
5. Keine experimentellen Schalter nur auf Verdacht aktivieren. Bei Abhängigkeitsfehlern genaue Spielversion/Content-Log notieren.
6. Welt öffnen; bei freiem Inventarplatz wird beim Beitritt ein Codex ergänzt, wenn keiner gefunden wurde.
7. Alternativ an der Werkbank herstellen: vier Papier + ein Eisenbarren, Papier kreuzförmig um das Eisen.

```text
_ P _
P I P
_ P _
```

Codex auswählen und benutzen; die eigene Touch-Interact-Beschriftung ist „WOLFVERSE öffnen“. Die erste native Darstellung muss auf dem Zielgerät bestätigt werden. Falls ein anderes Menü/Chat offen ist, dieses schließen und erneut benutzen. Debug nur mit aktivierten Cheats/geeigneten Rechten: `/give @s wolfverse:codex` oder als Spieler `/scriptevent wolfverse:menu`.

## Erste echte Spielschleife

Survival → erlaubte Monster selbst töten → zwischen belohnten Kills mindestens zwei Sekunden → Codex/Questjournal → nach drei gewerteten Kills Belohnung → Vorräte/Brot. Passive Tiere, Creative-Kills und sehr schnelle zusätzliche Kills belohnen nicht. Nach acht Rewards pro Profil/Zeitfenster warten.

Der Shop hat zunächst **nur Brot**, die Quest ist **einmalig**. Das ist eine bewusst kleine Foundation, kein schon ausbalanciertes Endlos-RPG. Keine Klassen/Begleiter/Clans werden als fertige Menüoptionen vorgetäuscht.

## BDS-Installation

Offizielle BDS-Version separat von Minecraft beziehen und deren EULA/Anleitung beachten. Die Testserver-Binärdateien sind nicht Teil des Projekts.

- Inhalt von `behavior_pack/` ohne `globals.d.ts` in einen eigenen BDS-BP-Ordner kopieren.
- Inhalt von `resource_pack/` in einen eigenen BDS-RP-Ordner kopieren.
- In der Zielwelt `world_behavior_packs.json`/`world_resource_packs.json` die tatsächlichen Header-UUIDs und Versionen aus den jeweiligen Manifesten aktivieren. Nicht neue UUIDs erfinden.
- Sicheres Online-/Allowlist-Konzept des echten Servers behalten; zum Installieren nicht auf öffentlichen Offline-Modus umstellen.
- Nur in einer isolierten Kopie die opt-in Probe aus [testing.md](testing.md) ausführen: das Tool überschreibt dort ausdrücklich die QA-Konfiguration.

BDS-Konsole kann `scriptevent wolfverse:status` ausführen. Im normalen Spielerchat ist dieser Admin-Status nicht freigegeben. Für Recovery siehe [data_model.md](data_model.md).

## Realms

Nur „wo unterstützt“: Installation der Weltkopie mit beiden Packs zuerst im Client prüfen und dann über den üblichen Realm-Weltpfad hochladen. API-/Geräte-/Realms-Version und experimentelle Beschränkungen können voneinander abweichen. **Kein Realm-Test wurde ausgeführt.** Keine `server-net`-/Backend-Pflicht; keine BDS-Konsole auf Realms voraussetzen.

## Updates

Welt sichern → getesteten neuen Build verwenden → Header-UUIDs erhalten → beide Packversionen korrekt aktualisieren → aktive Version kontrollieren → Migration/Profil/Inventar prüfen. Eine doppelte Packimport-Meldung ist kein Grund, die Welt oder Spielerprofile zu löschen. Im Zweifel zuerst mit einer frischen Testwelt eingrenzen.

Dieses GitHub-Projekt sichert Quellcode und Assets, **nicht automatisch den Minecraft-Spielstand**. Weltbackups bleiben separat notwendig.
