# Entwicklungsplan und Abnahmegates

Keine erfundenen Fertigstellungstermine. Aufwand und Reihenfolge werden nach echten Geräte-/Mehrspielerbefunden neu bewertet. Ein späterer Meilenstein gilt nicht als implementiert, nur weil sein Architekturvertrag existiert.

| Meilenstein | Ergebnis | Abnahme vor Ausbau |
|---|---|---|
| **M0 / 0.1 Foundation** | Packidentität; modularer Runtime-/Domänenkern; Profile/Migration/Validierung; XP und Level; eine Kill-Quest mit einmaliger Belohnung; Coins und ein geprüfter Inventarkauf; echter Codex, HUD/Einstellungen; reproduzierbare Builds/Tests | Unit-/Integrationsprüfungen, Packprüfung, API-Typprüfung, echter BDS-Start; iPad-Import/UI/Persistenz und Realm separat offen bis tatsächlich durchgeführt |
| **M1 / Fox Vertical Slice** | genau ein zuverlässiger Fuchsbegleiter: Besitz, beschwören/entlassen, folgen/warten/zurückrufen, Speichern/Rejoin/Entladen, ein originales Erscheinungsbild | Zwei Spieler dürfen fremde Begleiter nicht übernehmen; kein Duplikat bei Chunkentladung/Neustart; echter Zielgerätetest |
| **M2 / RPG & Combat** | neun Attribute mit nachgewiesener Wirkung; Klassen, ein Skill pro Klasse, Ressourcen/Cooldowns; gemeinsame Damage-/Effect-Pipeline | Keine nur dekorativen Stats; Schadens-/Heilungs-/Todesregressionen; Treffer-/Teleportkollisionen; API-Capability-Gates |
| **M3 / Quest & Content** | Questketten, Sammlung/Erkundung/Lieferung; erster NPC, kleiner Ruf-/Erfolgsbogen; einige eigenständige Kreaturen | Wiederholungen, Abgabe, Inventarverlust, Rejoin und parallele Spieler; klare Ressourcenlizenzen |
| **M4 / Boss & Dungeon** | ein Dungeon, ein Boss mit vier Phasen; Gruppen-/Regionsreservierung, ein Rätsel, Wellen und Belohnungen | Zwei Gruppen ohne Fortschrittsüberschreibung; Tod/Verlassen/Timeout/Serverneustart; keine doppelte Belohnung |
| **M5 / Items & World** | erste modellierte Waffe/Rüstung mit wirklichem Affix/Setbonus; Struktur-/Event-Vertical-Slice, weitere Biome/Dimensionen nur nach Capability-Prüfung | Kompatibilitäts-/Leistungsprofil; neue Chunks vs bestehende Landschaft dokumentiert; kein ungefragter Weltumbau |
| **M6 / Economy & SMP** | mehrere Währungen, Transfers, Shops/Auktion, Clans/Gruppe/Rechte, Rankings | Mehrdatensatz-Journal/Reconciliation; Konkurrenz/Crash-Fälle; Rollen- und Rechteprüfungen; Lasttests |
| **M7 / Optional Wolf-AI** | separate BDS-Integration zu vorhandenem Backend, Dialog-/Textgenerierung, Offline-Fallback | Keine Secrets im Pack; Authentifizierung/TLS/Timeouts/Limits; keine Ausführung ungeprüfter KI-Aktionen; Core ohne Netzwerk vollständig spielbar |
| **M8 / Content & Polish** | weitere Füchse/Kreaturen/Bosse/Dungeons, konsistente Modelle/Animationen/Sounds, Settings, Lokalisierung | Echte iPad-/Windows-/Realm-/BDS-Matrix, Updatepfad, Performancebudgets, Langzeit-/Mehrspielerregressionen |

## M0 – bewusst kleine, aber echte Schleife

1. Spieler betritt eine Testwelt und erhält ein validiertes dauerhaftes Profil sowie den herstellbaren Codex.
2. Codex öffnet echte native Menüs und zeigt tatsächlich gespeicherte Werte.
3. In Survival zählen erlaubte, begrenzte Monsterkills für XP und die Einstiegsquest.
4. Die Questbelohnung kann genau einmal im Profil bestätigt werden.
5. Coins kaufen einen echten Vorratsgegenstand zum serverkonfigurierten Preis.
6. Nach Wiederbeitritt sind Fortschritt/Einstellungen erhalten; unklare Kaufvorgänge werden gesperrt statt blind wiederholt.

Keine Klassenwahl ohne Effekte, keine tote Clan-/Auktions-/Boss-Schaltfläche und keine angebliche KI-Verbindung in M0. Die große Vision bleibt vollständig im Backlog erhalten.

## Prioritätsregeln

Datenintegrität und Sichtbarkeit echter Fehler vor Featurezahl. Danach Fuchs-Zuverlässigkeit vor vielen Skins. Eine getestete Boss-/Dungeon-Schleife vor sieben nur benannten Bossen. Erst Offline-Spielkern, dann optionale Online-KI. Grafik-/Soundarbeit wird am echten Inhalt überprüft, nicht nur in Marketingbildern.
