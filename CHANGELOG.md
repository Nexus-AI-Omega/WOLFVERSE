# Changelog

## 0.1.0 – Foundation development build

### Implementiert

- Eigenständige WOLFVERSE-Packidentität, feste BP/RP-/Script-UUIDs, stabile API-2.0-Bindung.
- Validiertes Schema-2-Spielerprofil, deklarierte synthetische v1-Migration, Byte-/Revisions-/Identitätsschutz.
- Tatsächliche Survival-Kill-XP, Levelkurve bis 100, persistente Reward-Limits.
- Einmalig claimbare Einstiegsquest, Coins, ein Stück Brot pro geprüftem serverseitigem Kauf.
- Kaufjournal mit konservativer Pending-Sperre und rein serverseitigem manuellen Recoverypfad.
- Eigener Codex/Rezept, vier native Menübereiche, optionales HUD und wirksame Anzeige-/Effekteinstellungen.
- Originale kleine Pixel-/Vektorassets und kurze synthetisierte UI-Töne, begrenzter Levelpartikeleffekt.
- Reproduzierbare Packbuilds und echte getrennte Domain-/Simulations-/Typ-/Tool-/BDS-Prüfungen.
- Architektur, Modul-/Ressourceninventar, vollständiger priorisierter Backlog, Sicherheits-/Daten-/Installations-/Testdokumentation.

### Durch Tests korrigiert

- Typecheck: Standardfehlercallback des Eventbus braucht zwei Parameter.
- Echter BDS: Rezept benötigt `unlock`-Daten; Papier-Unlock ergänzt.
- BDS-Testfixture: normale lebende Entity statt Armor Stand für Death-Callback.
- Reale Session-Tickdifferenz statt pauschaler Minute für spät beigetretene Spieler.
- Fachaktionen aus dem UI in autoritativen PlayerService verschoben; Identitätsmutation abgewiesen.

### Noch offen

iPad/Windows-Client-Darstellung/Touch/Ton, echter Player-Rejoin, Realm, zwei reale Spieler und Langzeitperformance. Kein pauschaler Release-/Mindestversionsnachweis. M1-Fuchs und alle weiteren RPG-/Content-/Online-Systeme sind geplant, nicht fertig.
