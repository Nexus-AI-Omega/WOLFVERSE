# Fehlersuche

| Symptom | Sichere Prüfung |
|---|---|
| Import schlägt fehl | Dateiendung `.mcaddon` behalten; beide `.mcpack` enthalten; genaue Bedrock-Version und Importmeldung notieren. Nicht Java verwenden. |
| Doppelte Packmeldung | gleiche UUID/Version bereits importiert; zuerst aktive Version in einer Testwelt prüfen. Keine Welt-/Profildaten löschen. |
| Abhängigkeit fehlt | BP **und** RP aktivieren; Server/UI 2.0 in dieser tatsächlichen Spielversion verfügbar? Keine Beta auf Verdacht. |
| Codex fehlt | Inventar voll? freien Slot schaffen und neu beitreten oder vier Papier/ein Eisen craften. Respawn ist nicht Erstbeitritt. |
| Codex öffnet nichts | Chat/andere Forms schließen, erneut benutzen; Content-Log prüfen. Touch-Use auf iPad ist noch ein offener Test. Mit geeigneten Cheats testweise Spieler-`/scriptevent wolfverse:menu` eingrenzen. |
| Kein XP | Survival? erlaubter Gegnertyp? eigener finaler Kill in 48 Blöcken? mindestens 2s Abstand? acht Rewards/min schon verbraucht? |
| Quest zählt nicht jeden Kill | nur belohnte Kills zählen; schnelle zusätzliche Farmkills können in Statistik erscheinen, aber keine Quest/XP geben. |
| Questbelohnung fehlt | drei gewertete Kills und manuell im Journal abholen; nach Claim keine Wiederholung. |
| Brot nicht gekauft | unter fünf Coins, abgelaufener Intent oder Profilrevision während Form geändert? Neu öffnen. Bei vollem Inventar muss Guthaben zurückkehren. |
| `purchase_uncertain` / Pending | keine Wiederholung erzwingen, Profil nicht löschen. Welt sichern und bestätigten Inventarstatus im Recoverypfad prüfen. |
| `profile_future_or_unknown_schema` | falscher/älterer Build für vorhandene Daten; gesicherte passende Version/Migration verwenden. Kein automatischer Reset. |
| `profile_json` / andere Profilprüfung | beschädigte/invalide Daten unverändert behalten; Weltkopie und anonymisierte Diagnose. |
| HUD kollidiert mit anderem Pack | WOLFVERSE-HUD in Einstellungen abschalten; Actionbar ist eine gemeinsam genutzte Vanilla-Fläche. |
| Geräusche/Partikel fehlen | eigene Einstellungen/RP/Lautstärke prüfen; reduzierte Qualität unterdrückt Levelpartikel. Reale Audio-/Grafikprüfung steht aus. |
| Adminbefehl vom Spieler abgelehnt | beabsichtigt. 0.1-Recovery nur mit tatsächlichem Server-Ursprung, kein Tag-/Namensbypass. |
| Realm verhält sich anders | Realm-/Client-/Packversion getrennt notieren; keine BDS-Konsole/HTTP-Funktion voraussetzen. Noch kein Realm-Nachweis. |

## Content-Log und Meldungen

Beim BDS-Start werden `COMPONENT_REGISTERED wolfverse:open_codex` und `READY 0.1.0 core=stable-2.0 no-network` erwartet. Die lokale Simulationssuite prüft zwar dieselben Pfade, ersetzt aber nicht den echten Content-Log. Startmarker allein beweisen noch nicht, dass ein Mensch die Menüs bedienen kann.

Bei einem Fehler angeben: Build-SHA aus `artifacts/build.json`, Minecraft-Version, Plattform/Host, reproduzierbare Schritte, Fehlercode und aktive andere Packs. Keine GitHub-/Backend-Tokens, API-Schlüssel oder persönlichen kompletten Profildaten senden.

## Vor jeder manuellen Korrektur

1. Welt kopieren und Original sichern.
2. Keine UUIDs oder `profileKey` umbenennen.
3. Keine fremden Pack-/WOLF-AI-Dateien entfernen.
4. Nur den betroffenen bekannten Zustand mit geprüftem Vertrag korrigieren.
5. [Gerätecheckliste](device_checklist.md) und passende Regressionstests erneut ausführen.
