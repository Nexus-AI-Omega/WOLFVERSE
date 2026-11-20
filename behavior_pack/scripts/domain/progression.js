import { CONFIG } from '../core/configuration.js';
import { requireThat } from '../core/errors.js';
export function levelFromXp(xp, maxLevel = CONFIG.maxLevel) {
  requireThat(Number.isSafeInteger(xp) && xp >= 0 && xp <= CONFIG.maxXp, 'xp_invalid');
  requireThat(Number.isSafeInteger(maxLevel) && maxLevel >= 1 && maxLevel <= 1000, 'level_cap_invalid');
  return Math.min(maxLevel, Math.floor((1 + Math.sqrt(1 + 4 * xp / CONFIG.xpCurveFactor)) / 2));
}
export function xpForLevel(level) { return CONFIG.xpCurveFactor * level * (level - 1); }
export function rankFromLevel(level) { return CONFIG.ranks.find(([minimum]) => level >= minimum)?.[1] ?? 'Anfänger'; }
export function recordKill(profile, fact, now, config = CONFIG) {
  requireThat(Number.isSafeInteger(now) && now >= 0, 'clock_invalid');
  if (!fact || !config.hostileTypes.includes(fact.typeId) || fact.survival !== true || !Number.isFinite(fact.distance) || fact.distance < 0 || fact.distance > config.killDistance) return { rewarded: false, reason: 'ineligible' };
  requireThat(profile.stats.monsterKills < Number.MAX_SAFE_INTEGER, 'stats_limit');
  profile.stats.monsterKills++;
  const budget = profile.rewards;
  if (now < budget.startMs || now < budget.lastMs) return { rewarded: false, reason: 'clock_rollback' };
  if (budget.startMs === 0 || now - budget.startMs >= config.killWindowMs) { budget.startMs = now; budget.count = 0; }
  if (budget.count >= config.maxRewardedKills) return { rewarded: false, reason: 'budget' };
  if (budget.count > 0 && now - budget.lastMs < config.killSpacingMs) return { rewarded: false, reason: 'spacing' };
  budget.lastMs = now; budget.count++;
  profile.xp = Math.min(config.maxXp, profile.xp + config.xpPerKill);
  if (!profile.quest.claimed) profile.quest.progress = Math.min(config.questTarget, profile.quest.progress + 1);
  return { rewarded: true, xp: config.xpPerKill };
}
export function claimQuest(profile, questId, config = CONFIG) {
  requireThat(questId === config.questId, 'quest_unknown');
  requireThat(!profile.quest.claimed, 'quest_already_claimed');
  requireThat(profile.quest.progress >= config.questTarget, 'quest_incomplete');
  requireThat(profile.coins <= config.maxCoins - config.questCoins, 'coins_limit');
  profile.quest.claimed = true; profile.coins += config.questCoins;
  profile.xp = Math.min(config.maxXp, profile.xp + config.questXp);
}
