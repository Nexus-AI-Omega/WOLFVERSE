# ADR 0001 – überprüfbare Bedrock-Foundation statt Scheinvollausbau

Status: angenommen für Foundation 0.1. Created by Nexus-AI-Omega.

## Kontext

Der Gesamtauftrag ist ein langfristiges zusammenhängendes Bedrock-RPG mit starkem Fuchsfokus, iPad/Windows/Realm/BDS-Zielen und optionalem Wolf-AI. Tausende ungetestete Dateien oder benannte tote Menüs würden weder Gameplay noch Portabilität beweisen. Nutzer erlaubt Preview/Beta und verlangt ein neues **privates** WOLFVERSE-Repository; die genaue Geräteversion ist noch unbekannt.

## Entscheidung

1. Manifest 2, Engine-Untergrenze 1.21.90, gepinnte stabile Server-/UI-API 2.0.0 als kleiner Core. Kein unnötiger Experimentzwang.
2. Reine Domäne → autoritative Services → validiertes versioniertes Profilrepository → Engineadapter. Native Forms/Actionbar statt globaler JSON-UI-Overrides oder falschem Inventarersatz.
3. Ein echter schmaler Loop: Kill-XP → eine Quest → Coins → ein tatsächlicher Inventarkauf. Nur funktionierende Bereiche sichtbar.
4. Konservatives Kaufjournal mit Pending-Sperre, weil Inventar und Profil nicht gemeinsam ACID sind. Keine unbelegte vollständige Crash-Exactly-once-Garantie.
5. M1 direkt danach: ein zuverlässiger eigener Fuchs inklusive Ownership-/Entlade-/Rejoin-Gates. Danach erst viele Varianten.
6. Optionales Netzwerk-/AI-Profil getrennt und BDS-spezifisch. Offline-Core bleibt unabhängig.
7. Node-/Simulations-/Typ-/Pack-/BDS-Evidenz getrennt von echten Geräte-/Realm-/Multiplayer-/Performance-Checks dokumentieren.
8. Eigenständiges neues Repository; bestehende Projekte und Wissensarchive unverändert behalten. Keine öffentlichen Lizenzen oder Credentials beiläufig veröffentlichen.

## Konsequenzen

Der erste Build ist klein und explizit ein Entwicklungsbuild. Er hat keine Klassen, Skilltrees, Begleiter, Bosse oder Clans, obwohl diese vollständig im Backlog stehen. Alte Mindestversion, native Touchbedienung und Realm-Fähigkeit gelten erst nach separatem Nachweis. Ein API-Upgrade ist später möglich, aber ein bewusster Versions-/Migrationsentscheid, kein stiller Dokumentationswechsel.
