import { CONFIG } from '../core/configuration.js';
import { requireThat, WolfError } from '../core/errors.js';

export const SCHEMA_VERSION = 2;
export const clone = value => JSON.parse(JSON.stringify(value));
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const integer = (x, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(x) && x >= 0 && x <= max;
const short = (x, max) => typeof x === 'string' && x.length > 0 && x.length <= max;
export function makeId() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : ((r & 3) | 8)).toString(16);
}); }
export function utf8Bytes(text) {
  let bytes = 0;
  for (const character of text) { const cp = character.codePointAt(0); bytes += cp <= 127 ? 1 : cp <= 2047 ? 2 : cp <= 65535 ? 3 : 4; }
  return bytes;
}
export function newProfile(id, now) {
  return { schemaVersion: SCHEMA_VERSION, profileId: id, revision: 0, createdAt: now,
    xp: 0, coins: 0, stats: { monsterKills: 0, deaths: 0, playTicks: 0 },
    quest: { id: CONFIG.questId, progress: 0, claimed: false },
    settings: { hud: true, sound: true, quality: 'standard', theme: 'cyan' },
    rewards: { startMs: 0, lastMs: 0, count: 0 }, pendingPurchase: null, history: [] };
}
export function validateProfile(p) {
  requireThat(record(p), 'profile_shape');
  requireThat(p.schemaVersion === SCHEMA_VERSION, 'profile_schema');
  const allowed = ['schemaVersion','profileId','revision','createdAt','xp','coins','stats','quest','settings','rewards','pendingPurchase','history'];
  requireThat(Object.keys(p).every(k => allowed.includes(k)), 'profile_unknown_field');
  requireThat(typeof p.profileId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.profileId), 'profile_id');
  requireThat(integer(p.revision) && integer(p.createdAt), 'profile_revision');
  requireThat(integer(p.xp, CONFIG.maxXp) && integer(p.coins, CONFIG.maxCoins), 'profile_balance');
  requireThat(record(p.stats) && ['monsterKills','deaths','playTicks'].every(k => integer(p.stats[k])), 'profile_stats');
  requireThat(record(p.quest) && p.quest.id === CONFIG.questId && integer(p.quest.progress, CONFIG.questTarget) && typeof p.quest.claimed === 'boolean', 'profile_quest');
  requireThat(!p.quest.claimed || p.quest.progress === CONFIG.questTarget, 'profile_quest_claim');
  requireThat(record(p.settings) && typeof p.settings.hud === 'boolean' && typeof p.settings.sound === 'boolean' && ['standard','reduced'].includes(p.settings.quality) && ['cyan','green'].includes(p.settings.theme), 'profile_settings');
  requireThat(record(p.rewards) && ['startMs','lastMs','count'].every(k => integer(p.rewards[k])) && p.rewards.count <= CONFIG.maxRewardedKills, 'profile_rewards');
  requireThat(Array.isArray(p.history) && p.history.length <= CONFIG.maxHistory, 'profile_history');
  const ids = new Set();
  for (const row of p.history) {
    requireThat(record(row) && short(row.id, 96) && !ids.has(row.id) && short(row.sku, 48) && integer(row.price, CONFIG.maxCoins) && row.price > 0 && ['debited','delivered','refunded'].includes(row.state), 'profile_history_row');
    ids.add(row.id);
  }
  if (p.pendingPurchase !== null) {
    const x = p.pendingPurchase;
    requireThat(record(x) && short(x.id,96) && short(x.sku,48) && integer(x.price, CONFIG.maxCoins) && x.price > 0 && integer(x.startedAt), 'profile_pending');
    requireThat(p.history.some(row => row.id === x.id && row.state === 'debited' && row.price === x.price && row.sku === x.sku), 'profile_pending_journal');
  }
  requireThat(p.history.every(row => row.state !== 'debited' || p.pendingPurchase?.id === row.id), 'profile_orphan_debit');
  return p;
}
export function decodeProfile(raw, idFactory = makeId, now = Date.now()) {
  if (raw === undefined) return { profile: validateProfile(newProfile(idFactory(), now)), write: true };
  requireThat(typeof raw === 'string', 'profile_storage_type');
  requireThat(utf8Bytes(raw) <= CONFIG.maxProfileBytes, 'profile_size_limit');
  let p; try { p = JSON.parse(raw); } catch { throw new WolfError('profile_json'); }
  requireThat(record(p), 'profile_shape');
  if (p.schemaVersion === 1) {
    requireThat(Object.keys(p).every(k => ['schemaVersion','profileId','createdAt','xp','coins','questKills','hud'].includes(k)), 'profile_legacy_unknown_field');
    const migrated = newProfile(p.profileId === undefined ? idFactory() : p.profileId, p.createdAt === undefined ? now : p.createdAt);
    migrated.xp = p.xp; migrated.coins = p.coins;
    migrated.quest.progress = p.questKills === undefined ? 0 : p.questKills; migrated.settings.hud = p.hud === undefined ? true : p.hud;
    return { profile: validateProfile(migrated), write: true };
  }
  requireThat(p.schemaVersion === SCHEMA_VERSION, 'profile_future_or_unknown_schema');
  return { profile: validateProfile(p), write: false };
}
