import { ActionFormData } from '@minecraft/server-ui';
import { CONFIG } from '../core/configuration.js';
import { errorCode, requireThat } from '../core/errors.js';
import { levelFromXp, xpForLevel, rankFromLevel } from '../domain/progression.js';

const TEXT = {
  profile_json: 'Profildaten sind beschädigt. Sie wurden nicht überschrieben.',
  profile_future_or_unknown_schema: 'Profilversion passt nicht zu diesem Build. Keine Daten wurden zurückgesetzt.',
  stale_revision: 'Dein Profil hat sich geändert. Bitte den Vorgang neu öffnen.',
  coins_insufficient: 'Nicht genügend Coins.', intent_expired: 'Die Kaufbestätigung ist abgelaufen. Bitte neu versuchen.',
  intent_used_or_unknown: 'Diese Bestätigung ist nicht mehr gültig.', purchase_pending: 'Ein unklarer Kauf ist gesperrt und muss geprüft werden.',
  purchase_uncertain: 'Kaufstatus unklar: keine automatische Wiederholung. Weitere Käufe bis zur Prüfung gesperrt.',
  quest_already_claimed: 'Belohnung wurde bereits abgeholt.', quest_incomplete: 'Die Aufgabe ist noch nicht erfüllt.'
};
export function friendlyError(error) { return TEXT[errorCode(error)] ?? `Vorgang abgebrochen (${errorCode(error)}). Details nur im Serverprotokoll.`; }

export class MenuController {
  constructor(repository, economy, actions, effects, onError) { this.repository = repository; this.economy = economy; this.actions = actions; this.effects = effects; this.onError = onError; this.sessions = new Map(); this.sequence = 0; }
  leave(id) { this.sessions.delete(id); }
  async open(player) {
    if (!player.isValid || this.sessions.has(player.id)) return;
    const session = ++this.sequence; this.sessions.set(player.id, session);
    let screen = 'main';
    const current = () => player.isValid && this.sessions.get(player.id) === session;
    try {
      this.effects(player, 'ui_open');
      while (screen && current()) {
        const profile = this.repository.read(player), level = levelFromXp(profile.xp);
        const title = (profile.settings.theme === 'green' ? '§a' : '§b') + 'WOLFVERSE§r';
        let form = new ActionFormData().title(title), intent;
        let buttonCount = 1;
        if (screen === 'main') {
          buttonCount = 4;
          form.body(`§7BEYOND MINECRAFT§r\n\nLevel ${level} · ${rankFromLevel(level)}\n${profile.coins} Coins\n\nFoundation ${CONFIG.version}`)
            .button('Profil', 'textures/ui/wolfverse/profile').button('Questjournal', 'textures/ui/wolfverse/quest')
            .button('Vorräte', 'textures/ui/wolfverse/shop').button('Einstellungen', 'textures/ui/wolfverse/settings');
        } else if (screen === 'profile') {
          const goal = level < CONFIG.maxLevel ? xpForLevel(level + 1) : null;
          form.body(`Level: ${level} · ${rankFromLevel(level)}\nGesamt-XP: ${profile.xp}${goal !== null ? ` / ${goal}` : ' (Levelmaximum)'}\nCoins: ${profile.coins}\nMonsterkills (Survival, Reichweite): ${profile.stats.monsterKills}\nTode: ${profile.stats.deaths}\nSimulierte Spielzeit: ${Math.floor(profile.stats.playTicks / 1200)} Minuten\n\nProfil: ${profile.profileId}\nSchema ${profile.schemaVersion} · Revision ${profile.revision}`)
            .button('Zurück');
        } else if (screen === 'quest') {
          form.body(`§bDie erste Wacht§r\n\nBesiege ${CONFIG.questTarget} gewertete Monster in Survival.\nFortschritt: ${profile.quest.progress}/${CONFIG.questTarget}\nBelohnung: ${CONFIG.questXp} XP + ${CONFIG.questCoins} Coins\n\n${profile.quest.claimed ? 'Abgeschlossen und belohnt.' : 'Reward-Limits gegen schnelles Farmen gelten auch hier.'}`);
          if (!profile.quest.claimed && profile.quest.progress >= CONFIG.questTarget) { buttonCount++; form.button('Belohnung erhalten'); }
          form.button('Zurück');
        } else if (screen === 'shop') {
          form.body(`Coins: ${profile.coins}\n\n1 × Brot: ${CONFIG.products.bread.price} Coins\nPreis wird auf dem Server geprüft.\n\n${profile.pendingPurchase ? 'Ein Kauf ist ungeklärt. Neue Käufe bleiben bis zur Prüfung gesperrt.' : 'Bei vollem Inventar wird nicht geliefert und der Betrag zurückgebucht.'}`);
          if (!profile.pendingPurchase) { buttonCount++; intent = this.economy.issue(player, 'bread'); form.button('Brot kaufen', 'textures/items/bread'); }
          form.button('Zurück');
        } else if (screen === 'settings') {
          buttonCount = 5;
          form.body('Diese Einstellungen haben bereits eine echte Wirkung. Das HUD verwendet die geteilte Actionbar und ist abschaltbar.')
            .button(`HUD: ${profile.settings.hud ? 'Ein' : 'Aus'}`)
            .button(`Effekte: ${profile.settings.quality === 'standard' ? 'Standard' : 'Reduziert'}`)
            .button(`Sound: ${profile.settings.sound ? 'Ein' : 'Aus'}`)
            .button(`Akzent: ${profile.settings.theme === 'cyan' ? 'Cyan' : 'Grün'}`).button('Zurück');
        } else return;
        const response = await form.show(player);
        if (!current() || response.canceled || response.selection === undefined) return;
        const selection = response.selection;
        requireThat(Number.isSafeInteger(selection) && selection >= 0 && selection < buttonCount, 'ui_selection_invalid');
        if (screen === 'main') {
          requireThat(selection < 4, 'ui_selection_invalid'); screen = ['profile','quest','shop','settings'][selection]; continue;
        }
        try {
          if (screen === 'quest' && !profile.quest.claimed && profile.quest.progress >= CONFIG.questTarget && selection === 0) {
            this.actions.claimStarterQuest(player, profile.revision);
            player.sendMessage(`§bWOLFVERSE§r · Die erste Wacht abgeschlossen: +${CONFIG.questXp} XP, +${CONFIG.questCoins} Coins.`);
            this.effects(player, 'quest_complete');
          } else if (screen === 'shop' && !profile.pendingPurchase && selection === 0) {
            const result = this.economy.purchase(player, 'bread', intent);
            player.sendMessage(result.delivered ? '§bWOLFVERSE§r · Brot gekauft.' : '§bWOLFVERSE§r · Inventar voll; Coins zurückgebucht.');
          } else if (screen === 'settings' && selection < 4) {
            this.actions.toggleSetting(player, ['hud','quality','sound','theme'][selection], profile.revision);
            if (selection === 0) player.onScreenDisplay.setActionBar('');
            continue;
          }
        } catch (error) { player.sendMessage('§bWOLFVERSE§r · ' + friendlyError(error)); this.onError('ui_action', error); }
        screen = 'main';
      }
    } catch (error) {
      this.onError('ui', error);
      try { if (player.isValid) player.sendMessage('§bWOLFVERSE§r · ' + friendlyError(error) + ' Andere geöffnete Menüs schließen und erneut versuchen.'); } catch {}
    } finally { if (this.sessions.get(player.id) === session) this.sessions.delete(player.id); }
  }
}
