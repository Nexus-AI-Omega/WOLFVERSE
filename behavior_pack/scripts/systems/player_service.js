import { CONFIG } from '../core/configuration.js';
import { requireThat } from '../core/errors.js';
import { claimQuest, levelFromXp, recordKill } from '../domain/progression.js';

/** Authoritative commands shared by runtime and UI. No menu writes profile fields directly. */
export class PlayerService {
  constructor(repository, bus) { this.repository = repository; this.bus = bus; }
  progressionChange(player, mutate, reason, expectedRevision = undefined) {
    let beforeLevel;
    const after = this.repository.update(player, profile => { beforeLevel = levelFromXp(profile.xp); mutate(profile); }, expectedRevision);
    this.bus.emit('profile.changed', { playerId: player.id, beforeLevel, afterLevel: levelFromXp(after.xp), reason });
    return after;
  }
  recordKill(player, fact, now) {
    return this.progressionChange(player, profile => recordKill(profile, fact, now), 'kill');
  }
  claimStarterQuest(player, expectedRevision) {
    return this.progressionChange(player, profile => claimQuest(profile, CONFIG.questId), 'quest', expectedRevision);
  }
  toggleSetting(player, setting, expectedRevision) {
    requireThat(['hud','sound','quality','theme'].includes(setting), 'setting_unknown');
    return this.repository.update(player, profile => {
      if (setting === 'hud') profile.settings.hud = !profile.settings.hud;
      if (setting === 'sound') profile.settings.sound = !profile.settings.sound;
      if (setting === 'quality') profile.settings.quality = profile.settings.quality === 'standard' ? 'reduced' : 'standard';
      if (setting === 'theme') profile.settings.theme = profile.settings.theme === 'cyan' ? 'green' : 'cyan';
    }, expectedRevision);
  }
  recordDeath(player) { return this.repository.update(player, p => { p.stats.deaths++; }); }
  addPlayTicks(player, ticks) {
    requireThat(Number.isSafeInteger(ticks) && ticks > 0, 'ticks_invalid');
    return this.repository.update(player, p => { p.stats.playTicks += ticks; });
  }
}
