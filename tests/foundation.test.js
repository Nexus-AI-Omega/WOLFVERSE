import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../behavior_pack/scripts/core/configuration.js';
import { ProfileRepository } from '../behavior_pack/scripts/core/data_manager.js';
import { EventBus } from '../behavior_pack/scripts/core/event_manager.js';
import { requireServerOrigin } from '../behavior_pack/scripts/core/security.js';
import { newProfile, decodeProfile, validateProfile, utf8Bytes } from '../behavior_pack/scripts/domain/profile.js';
import { levelFromXp, xpForLevel, recordKill, claimQuest } from '../behavior_pack/scripts/domain/progression.js';
import { EconomyService, IntentStore } from '../behavior_pack/scripts/systems/economy.js';
const ID = '00000000-0000-4000-8000-000000000001';
const profile = () => newProfile(ID, 100000);
const code = expected => error => error.code === expected;
class Actor {
  constructor(id = 'player-one') { this.id = id; this.data = new Map(); this.writes = 0; this.failWrites = new Set(); }
  getDynamicProperty(key) { return this.data.get(key); }
  setDynamicProperty(key, value) { this.writes++; if (this.failWrites.has(this.writes)) throw Error('injected storage failure'); this.data.set(key, value); }
}
function fixture(balance = 20, inventoryMode = 'success') {
  const actor = new Actor(); let time = 100000, serial = 0, items = 0;
  const ids = () => `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`;
  const repository = new ProfileRepository({ now: () => time, idFactory: ids });
  repository.read(actor); repository.update(actor, p => { p.coins = balance; });
  const intents = new IntentStore(() => time, ids);
  const inventory = { addOne() {
    if (inventoryMode === 'throw-before') throw Error('inventory before');
    if (inventoryMode === 'full') return false;
    items++; if (inventoryMode === 'throw-after') throw Error('inventory after');
    return true;
  } };
  return { actor, repository, intents, economy: new EconomyService(repository, inventory, intents, () => time), items: () => items, advance: ms => { time += ms; } };
}

test('new profile is valid and schema-versioned', () => { const p = profile(); assert.equal(validateProfile(p).schemaVersion, 2); });
test('undefined storage creates a profile; malformed storage is not silently reset', () => {
  assert.equal(decodeProfile(undefined, () => ID, 100).write, true);
  assert.throws(() => decodeProfile('{bad'), code('profile_json'));
  assert.throws(() => decodeProfile(4), code('profile_storage_type'));
});
test('legacy v1 migration preserves declared XP/coins/quest/HUD', () => {
  const result = decodeProfile(JSON.stringify({ schemaVersion: 1, profileId: ID, xp: 123, coins: 7, questKills: 2, hud: false }), () => ID, 1);
  assert.equal(result.write, true); assert.equal(result.profile.xp, 123); assert.equal(result.profile.coins, 7); assert.equal(result.profile.quest.progress, 2); assert.equal(result.profile.settings.hud, false);
});
test('future schema rejected without overwriting old data', () => {
  const a = new Actor(); const raw = '{"schemaVersion":999}'; a.data.set(CONFIG.profileKey, raw);
  assert.throws(() => new ProfileRepository().read(a), code('profile_future_or_unknown_schema'));
  assert.equal(a.getDynamicProperty(CONFIG.profileKey), raw);
});
for (const invalid of [-1, 0.5, NaN, Infinity, '5', CONFIG.maxCoins + 1]) test(`coin validation rejects ${String(invalid)}`, () => {
  const p = profile(); p.coins = invalid; assert.throws(() => validateProfile(p), code('profile_balance'));
});
test('unknown privilege-like root field rejected', () => { const p = profile(); p.isAdmin = true; assert.throws(() => validateProfile(p), code('profile_unknown_field')); });
test('UTF-8 budget counts non-ASCII and supplementary characters', () => { assert.equal(utf8Bytes('Aä狼🐺'), 10); });
test('repository revisions reject stale updates', () => {
  const f = fixture(); const p = f.repository.read(f.actor); f.repository.update(f.actor, x => { x.coins++; });
  assert.throws(() => f.repository.update(f.actor, x => { x.coins++; }, p.revision), code('stale_revision'));
});
test('repository returns copies and failed validation does not mutate storage', () => {
  const f = fixture(); const p = f.repository.read(f.actor); p.coins = 999; assert.equal(f.repository.read(f.actor).coins, 20);
  assert.throws(() => f.repository.update(f.actor, p => { p.coins = -1; })); assert.equal(f.repository.read(f.actor).coins, 20);
});
test('repository byte limit fails before write', () => {
  const f = fixture(); const before = f.actor.getDynamicProperty(CONFIG.profileKey);
  assert.throws(() => f.repository.update(f.actor, p => { p.settings.extra = '狼'.repeat(4000); }), code('profile_size_limit'));
  assert.equal(f.actor.getDynamicProperty(CONFIG.profileKey), before);
});
test('async mutations and reentrant profile updates fail closed', () => {
  const f = fixture();
  assert.throws(() => f.repository.update(f.actor, async p => { p.coins++; }), code('async_profile_mutation'));
  assert.throws(() => f.repository.update(f.actor, () => f.repository.update(f.actor, p => { p.coins++; })), code('profile_busy'));
  assert.equal(f.repository.read(f.actor).coins, 20);
});
test('level boundaries and cap follow real XP curve', () => {
  assert.equal(levelFromXp(0), 1); assert.equal(levelFromXp(99), 1); assert.equal(levelFromXp(100), 2);
  assert.equal(levelFromXp(300), 3); assert.equal(xpForLevel(100), 495000); assert.equal(levelFromXp(1000000000), 100);
  assert.throws(() => levelFromXp(-1));
});
test('survival hostile kill grants real XP and quest progress', () => {
  const p = profile(); const r = recordKill(p, { typeId: 'minecraft:zombie', survival: true, distance: 3 }, 100000);
  assert.equal(r.rewarded, true); assert.equal(p.xp, 12); assert.equal(p.quest.progress, 1);
});
for (const fact of [{ typeId:'minecraft:cow', survival:true, distance:1 },{typeId:'minecraft:zombie',survival:false,distance:1},{typeId:'minecraft:zombie',survival:true,distance:100},{typeId:'minecraft:zombie',survival:true,distance:NaN}]) test('ineligible kill cannot generate rewards: '+JSON.stringify(fact), () => {
  const p = profile(); assert.equal(recordKill(p, fact, 100000).rewarded, false); assert.equal(p.xp, 0); assert.equal(p.quest.progress, 0);
});
test('persistent reward spacing and rolling budget cap fast farming', () => {
  const p = profile(); const fact = { typeId:'minecraft:zombie',survival:true,distance:1 };
  recordKill(p, fact, 100000); assert.equal(recordKill(p, fact, 100001).reason, 'spacing');
  for (let n=1; n<8; n++) assert.equal(recordKill(p, fact, 100000+n*2000).rewarded, true);
  assert.equal(recordKill(p, fact, 118000).reason, 'budget');
  assert.equal(recordKill(p, fact, 160000).rewarded, true);
});
test('clock rollback does not reset farming budget', () => {
  const p=profile(), fact={typeId:'minecraft:zombie',survival:true,distance:1}; recordKill(p,fact,100000);
  assert.equal(recordKill(p,fact,99999).reason,'clock_rollback'); assert.equal(p.xp,12);
});
test('quest reward and completion are one update and cannot be claimed twice', () => {
  const p=profile(); p.quest.progress=3; claimQuest(p,CONFIG.questId); assert.equal(p.coins,30); assert.equal(p.xp,75);
  assert.throws(()=>claimQuest(p,CONFIG.questId),code('quest_already_claimed')); assert.equal(p.coins,30);
});
test('incomplete or unknown quest gives nothing', () => {
  const p=profile(); assert.throws(()=>claimQuest(p,CONFIG.questId),code('quest_incomplete'));
  assert.throws(()=>claimQuest(p,'fake'),code('quest_unknown')); assert.equal(p.coins,0);
});
test('purchase debits configured price and delivers exactly one item in a successful synchronous operation', () => {
  const f=fixture(); const id=f.economy.issue(f.actor,'bread'); const result=f.economy.purchase(f.actor,'bread',id);
  assert.equal(result.delivered,true); assert.equal(f.items(),1); assert.equal(result.profile.coins,15); assert.equal(result.profile.pendingPurchase,null);
});
test('same intent cannot buy twice', () => {
  const f=fixture(); const id=f.economy.issue(f.actor,'bread'); f.economy.purchase(f.actor,'bread',id);
  assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('intent_used_or_unknown')); assert.equal(f.items(),1); assert.equal(f.repository.read(f.actor).coins,15);
});
test('insufficient funds cannot debit or deliver', () => {
  const f=fixture(4); const id=f.economy.issue(f.actor,'bread'); assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('coins_insufficient'));
  assert.equal(f.items(),0); assert.equal(f.repository.read(f.actor).coins,4);
});
test('full inventory returns coins without creating items', () => {
  const f=fixture(20,'full'); const r=f.economy.purchase(f.actor,'bread',f.economy.issue(f.actor,'bread'));
  assert.equal(r.delivered,false); assert.equal(r.profile.coins,20); assert.equal(f.items(),0); assert.equal(r.profile.history.at(-1).state,'refunded');
});
test('expired and cross-player intents rejected', () => {
  const f=fixture(); let id=f.economy.issue(f.actor,'bread'); f.advance(30000);
  assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('intent_expired'));
  id=f.economy.issue(f.actor,'bread'); assert.throws(()=>f.intents.consume(id,'foreign','bread'),code('intent_owner')); assert.equal(f.items(),0);
});
test('client cannot choose arbitrary or prototype product', () => { const f=fixture(); assert.throws(()=>f.economy.issue(f.actor,'__proto__'),code('product_unknown')); });
test('stale intent revision cannot spend changed profile', () => {
  const f=fixture(); const id=f.economy.issue(f.actor,'bread'); f.repository.update(f.actor,p=>{p.xp++;});
  assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('stale_revision')); assert.equal(f.items(),0);
});
for (const mode of ['throw-before','throw-after']) test(`uncertain inventory result ${mode} quarantines, never blindly redelivers`, () => {
  const f=fixture(20,mode), id=f.economy.issue(f.actor,'bread'); assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('purchase_uncertain'));
  assert.equal(f.repository.read(f.actor).coins,15); assert.ok(f.repository.read(f.actor).pendingPurchase);
  assert.throws(()=>f.economy.issue(f.actor,'bread'),code('purchase_pending'));
});
test('storage failure before the accepted debit prevents delivery', () => {
  const f=fixture(); const id=f.economy.issue(f.actor,'bread'); f.actor.failWrites.add(f.actor.writes+1);
  assert.throws(()=>f.economy.purchase(f.actor,'bread',id)); assert.equal(f.items(),0); assert.equal(f.repository.read(f.actor).coins,20);
});
test('storage failure after delivery leaves serialized pending record across repository restart', () => {
  const f=fixture(); const id=f.economy.issue(f.actor,'bread'); f.actor.failWrites.add(f.actor.writes+2);
  assert.throws(()=>f.economy.purchase(f.actor,'bread',id),code('purchase_uncertain')); assert.equal(f.items(),1);
  const restarted=new ProfileRepository(); const p=restarted.read(f.actor); assert.equal(p.coins,15); assert.equal(p.pendingPurchase.id,id);
});
test('manual trusted-server confirmation clears uncertainty without creating another item', () => {
  const f=fixture(20,'throw-after'), id=f.economy.issue(f.actor,'bread'); assert.throws(()=>f.economy.purchase(f.actor,'bread',id));
  const p=f.economy.resolveFromTrustedServer(f.actor,id,'confirm'); assert.equal(p.coins,15); assert.equal(p.pendingPurchase,null); assert.equal(f.items(),1);
});
test('manual verified non-delivery refund restores funds once only', () => {
  const f=fixture(20,'throw-before'), id=f.economy.issue(f.actor,'bread'); assert.throws(()=>f.economy.purchase(f.actor,'bread',id));
  assert.equal(f.economy.resolveFromTrustedServer(f.actor,id,'refund').coins,20);
  assert.throws(()=>f.economy.resolveFromTrustedServer(f.actor,id,'refund'),code('purchase_pending_mismatch'));
});
test('non-server, block, NPC or player-shaped script events cannot enter recovery endpoint', () => {
  for (const e of [{sourceType:'Entity'},{sourceType:'Block'},{sourceType:'NPCDialogue'},{sourceType:'Server',sourceEntity:{}},{sourceType:'Server',initiator:{}}]) assert.throws(()=>requireServerOrigin(e),code('admin_source_required'));
  assert.doesNotThrow(()=>requireServerOrigin({sourceType:'Server'}));
});
test('event handler failure isolated; unsubscribe works', () => {
  let errors=0, calls=0; const bus=new EventBus(()=>errors++); bus.on('x',()=>{throw Error('test');}); const off=bus.on('x',()=>calls++);
  bus.emit('x',{}); off(); bus.emit('x',{}); assert.equal(calls,1); assert.equal(errors,2);
});


test('repository prevents mutating stable identity and revision counters', () => {
  const f=fixture(); const original=f.repository.read(f.actor);
  for(const field of ['profileId','createdAt','revision']) {
    assert.throws(()=>f.repository.update(f.actor,p=>{p[field]=field==='profileId'?'ffffffff-ffff-4fff-8fff-ffffffffffff':42;}),code('profile_identity_immutable'));
  }
  assert.deepEqual(f.repository.read(f.actor),original);
});
test('oversized stored JSON is rejected before decode and not overwritten', () => {
  const actor=new Actor();const raw=' '.repeat(CONFIG.maxProfileBytes+1);actor.data.set(CONFIG.profileKey,raw);
  assert.throws(()=>new ProfileRepository().read(actor),code('profile_size_limit'));assert.equal(actor.getDynamicProperty(CONFIG.profileKey),raw);
});
test('reopening the shop replaces this owner intent rather than exhausting global capacity', () => {
  const f=fixture();let first,last;
  for(let i=0;i<200;i++){last=f.economy.issue(f.actor,'bread');if(i===0)first=last;}
  assert.equal(f.intents.entries.size,1);assert.throws(()=>f.economy.purchase(f.actor,'bread',first),code('intent_used_or_unknown'));
  assert.equal(f.economy.purchase(f.actor,'bread',last).delivered,true);
});
