# Im echten BDS-Lauf gefundene und behobene Probleme

Die ersten Versuche waren nicht pauschal erfolgreich. Die finalen maschinenlesbaren Ergebnisse stehen in `bds-verification.json`.

1. Der erste Netzwerkdownload per curl brach mit einem TLS-EOF ab. Ein neuer HTTPS-Download in geprüften Byte-Bereichen gelang; ZIP-CRC und der HTTPS-Content-MD5 wurden geprüft. Herkunft und lokaler SHA-256 stehen in `../research/bds-download.json`.
2. Der erste Packstart meldete `1.20+ Recipes require unlock data`. Das Codex-Rezept erhielt ein echtes Paper-Unlock. Dies war ein echter Packfehler, kein ignorierter Hinweis.
3. Der erste Death-Event-Test verwendete einen Armor Stand. Dessen `kill()` lieferte in diesem Versuch nicht das erwartete Living-Entity-Death-Event. Das Testobjekt wurde durch einen Zombie ersetzt; der spätere Test prüft ID, Typ und Location im tatsächlichen Death-Callback. Dies ist keine Behauptung, Armor Stands würden wie normale Gegner sterben.
4. Der Logscanner wurde auf das tatsächlich ausgegebene BDS-Format `[... ERROR] [Recipes]` erweitert, damit der Rezeptfehler auch unabhängig vom Probeergebnis zum Fehlschlag führt.

Keine dieser Prüfungen verbindet einen echten Spieler oder zeigt native Menüs auf einem iPad. Entity-Daten und ein echter Chest-Container prüfen APIs und Serviceintegration, **nicht** den noch offenen Player-Rejoin-/Touch-Test.
