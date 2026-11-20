# Offene Geräte-/Realm-Abnahme

**Alle Felder sind zunächst offen, nicht bestanden.** Hier wurden keine iPad-/Realm-Ergebnisse erfunden.

## Testkopf ausfüllen

- Tester / Datum:
- exakte sichtbare Minecraft-Version und ggf. interner Build:
- Stable oder Preview:
- Gerät / Betriebssystem / Modell:
- Host: lokale Welt / Realm / eigener BDS:
- WOLFVERSE-Version und SHA-256 aus `artifacts/build.json`:
- frische Welt oder gesicherte Kopie:
- weitere aktive Packs:
- Ergebnis und Content-Log-Datei:

## Foundation

- [ ] Beide Packs importieren und aktivieren; keine fehlende API-/Packabhängigkeit.
- [ ] Codex-Textur sichtbar; automatische Ergänzung bei freiem Slot; kein zusätzlicher Codex beim Respawn.
- [ ] Werkbankrezept mit vier Papier/einem Eisen funktioniert und wird nach Papierbesitz freigeschaltet.
- [ ] Codex mit Touch bzw. Maus/Controller benutzen; native Hauptform öffnet sich.
- [ ] Profil, Quest, Vorräte und Einstellungen öffnen tatsächlich; kein toter Button.
- [ ] Bei offenem Chat/anderer UI sauber abbrechen, danach wieder benutzbar.
- [ ] Survival-Zombiekill gewährt 12 XP; passive Tiere/Creative nicht.
- [ ] Drei ausreichend getrennte belohnte Kills erfüllen die Quest; schnelle Farmkills nicht unbegrenzt.
- [ ] Einmalige Questbelohnung 75 XP/30 Coins; zweiter Versuch erzeugt nichts.
- [ ] Brot für 5 Coins im Inventar; Guthaben korrekt.
- [ ] Volles Inventar: kein Gegenstand verloren, Guthaben korrekt zurück; kein hängender unbegründeter Kauf.
- [ ] HUD aus/an, Cyan/Grün, Sound aus/an und reduzierte Partikelqualität zeigen echte Wirkung.
- [ ] Levelaufstieg erzeugt nur begrenzten Effekt, kein störendes Dauerfeuer.
- [ ] Tod/Respawn: Stats, Profil und Settings korrekt; kein fremdes Profil.
- [ ] Welt verlassen und erneut öffnen: identische Profil-ID, XP, Coins, Questclaim und Settings.
- [ ] Vollständig Minecraft schließen und erneut öffnen: dieselben Werte.

## Zwei echte Spieler / Realm separat

- [ ] Zwei verschiedene Profile, keine gegenseitige UI-/Coin-/Queständerung.
- [ ] Parallel geöffnete Shops liefern jeweils nur an den tatsächlichen Spieler.
- [ ] Wiederholtes Öffnen/Schließen und Verlassen während Formwartezeit erzeugt keine alte Aktion.
- [ ] Operator-/Nichtoperatorgrenzen einschließlich Recovery-Ablehnung geprüft.
- [ ] Upload/Download der Realm-Weltkopie erhält Packabhängigkeiten und Spielerdaten.

## Leistung / Konflikte

- [ ] Basis-FPS/Tickzeit ohne und mit Pack auf demselben Gerät/Host vergleichen; Messmethode/Spielerzahl notieren.
- [ ] Mindestens längere normale Spielsitzung, Join/Leave, verschiedene Dimensionen, Tod und voller Rucksack.
- [ ] Andere Actionbar-Packs: Konflikt dokumentieren; WOLFVERSE-HUD abschalten hilft tatsächlich.
- [ ] Content-Log auf Script-, Rezept-, Textur-, Sound- und Partikelfehler prüfen.

Fehler mit exakten Schritten/Build/Host melden, keine Tokens oder kompletten privaten Profildaten veröffentlichen. M1-Fuchs-Abnahme folgt erst mit dessen tatsächlicher Implementierung.
