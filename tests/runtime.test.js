import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
register(new URL('./bedrock-loader.mjs', import.meta.url));
const { system, world, mock, MockPlayer, ItemStack, GameMode, join, leave, reset } = await import('./mocks/server.js');
const { forms } = await import('./mocks/server-ui.js');
const { CONFIG } = await import('../behavior_pack/scripts/core/configuration.js');
let serial = 0;
async function fixture() {
  reset(); forms.reset();
  await import(`../behavior_pack/scripts/main.js?simulation=${++serial}`);
  system.beforeEvents.startup.emit({ itemComponentRegistry: { registerCustomComponent(id, component) { mock.components.set(id, component); } } });
  system.tick();
  const player = new MockPlayer('one'); join(player);
  return player;
}
const profile = p => JSON.parse(p.getDynamicProperty(CONFIG.profileKey));
function setProfile(p, change) { const data = profile(p); change(data); p.setDynamicProperty(CONFIG.profileKey, JSON.stringify(data)); }
async function ui(player, responses) {
  forms.responses.push(...responses);
  system.afterEvents.scriptEventReceive.emit({ id: 'wolfverse:menu', sourceType: 'Entity', sourceEntity: player });
  await new Promise(setImmediate);
}
function kill(player, id = 'dead-1', typeId = 'minecraft:zombie') {
  world.afterEvents.entityDie.emit({ deadEntity: { id, typeId, location: { x: 1, y: 64, z: 0 } }, damageSource: { damagingEntity: player } });
}

test('simulation: startup registers usable component; join creates isolated profiles and Codex', async () => {
  const p = await fixture(), other = new MockPlayer('two'); join(other);
  assert.ok(mock.components.has('wolfverse:open_codex')); assert.equal(p.inventory.count(CONFIG.codexId),1);
  assert.notEqual(profile(p).profileId,profile(other).profileId);
  world.afterEvents.playerSpawn.emit({ player: p, initialSpawn: false }); assert.equal(p.inventory.count(CONFIG.codexId),1);
});
test('simulation: registered Codex onUse schedules real menu controller and no placeholder buttons', async () => {
  const p=await fixture(); forms.responses.push({ canceled: true });
  mock.components.get('wolfverse:open_codex').onUse({ source: p }); system.tick(); await new Promise(setImmediate);
  assert.deepEqual(forms.seen.at(-1).buttons.map(x=>x.text),['Profil','Questjournal','Vorräte','Einstellungen']);
});
test('simulation: kill adapter applies XP once per entity and excludes Creative/passive kills', async () => {
  const p=await fixture(); kill(p); kill(p); assert.equal(profile(p).xp,12);
  p.mode=GameMode.Creative; kill(p,'dead-2'); p.mode=GameMode.Survival; kill(p,'dead-3','minecraft:cow'); assert.equal(profile(p).xp,12);
});
test('simulation: three paced kills, native-form intents, one quest claim and actual inventory adapter purchase', async t => {
  const p=await fixture(); let now=1000000; t.mock.method(Date,'now',()=>now);
  for(let i=0;i<3;i++){kill(p,'dead-'+i);now+=2500;}
  assert.equal(profile(p).quest.progress,3);
  await ui(p,[{selection:1},{selection:0},{canceled:true}]); assert.equal(profile(p).coins,30); assert.equal(profile(p).quest.claimed,true);
  await ui(p,[{selection:1},{selection:0},{canceled:true}]); assert.equal(profile(p).coins,30);
  await ui(p,[{selection:2},{selection:0},{canceled:true}]); assert.equal(profile(p).coins,25); assert.equal(p.inventory.count('minecraft:bread'),1);
});
test('simulation: full inventory is not charged', async () => {
  const p=await fixture();setProfile(p,x=>{x.coins=20;});
  for(let i=0;i<p.inventory.size;i++)p.inventory.setItem(i,new ItemStack('minecraft:cobblestone',64));
  await ui(p,[{selection:2},{selection:0},{canceled:true}]);assert.equal(profile(p).coins,20);assert.equal(p.inventory.count('minecraft:bread'),0);
});
test('simulation: HUD, sound, quality and accent settings change actual presentation paths', async () => {
  const p=await fixture();
  await ui(p,[{selection:3},{selection:0},{selection:1},{selection:2},{selection:3},{selection:4},{canceled:true}]);
  assert.deepEqual(profile(p).settings,{hud:false,sound:false,quality:'reduced',theme:'green'});
  assert.equal(p.hud.at(-1),'');const length=p.hud.length;system.tick(40);assert.equal(p.hud.length,length);
});
test('simulation: a changed profile revision during a form rejects the old action', async () => {
  const p=await fixture();setProfile(p,x=>{x.coins=20;});
  await ui(p,[{selection:2},()=>{setProfile(p,x=>{x.revision++;});return {selection:0};},{canceled:true}]);
  assert.equal(profile(p).coins,20);assert.equal(p.inventory.count('minecraft:bread'),0);assert.ok(p.messages.some(x=>x.includes('geändert')));
});
test('simulation: leave/rejoin cleans UI session and retains the supplied player property store', async () => {
  const p=await fixture();setProfile(p,x=>{x.xp=250;});const id=profile(p).profileId;
  let complete;const deferred=new Promise(resolve=>{complete=resolve;});
  forms.responses.push(()=>deferred);system.afterEvents.scriptEventReceive.emit({id:'wolfverse:menu',sourceType:'Entity',sourceEntity:p});
  leave(p);complete({selection:2});await new Promise(setImmediate);
  const replacement=new MockPlayer('one',p.data);join(replacement);assert.equal(profile(replacement).xp,250);assert.equal(profile(replacement).profileId,id);
  await ui(replacement,[{canceled:true}]);assert.equal(forms.seen.at(-1).playerId,'one');
});
test('simulation: invalid form selection cannot call an action', async () => {
  const p=await fixture();await ui(p,[{selection:-1}]);assert.equal(profile(p).coins,0);assert.ok(p.messages.some(x=>x.includes('ui_selection_invalid')));
});
test('simulation: recovery denies entity/NPC/block sources, including forged Server with a source entity', async () => {
  const p=await fixture();setProfile(p,x=>{x.coins=15;x.pendingPurchase={id:'uncertain',sku:'bread',price:5,startedAt:1};x.history=[{id:'uncertain',sku:'bread',price:5,state:'debited'}];});
  const message=JSON.stringify({profileId:profile(p).profileId,id:'uncertain',resolution:'refund'});
  for(const sourceType of ['Entity','NPCDialogue','Block','Server'])system.afterEvents.scriptEventReceive.emit({id:'wolfverse:resolve_purchase',sourceType,sourceEntity:p,message});
  assert.equal(profile(p).coins,15);assert.ok(profile(p).pendingPurchase);
  system.afterEvents.scriptEventReceive.emit({id:'wolfverse:resolve_purchase',sourceType:'Server',message});assert.equal(profile(p).coins,20);assert.equal(profile(p).pendingPurchase,null);
});
test('simulation: playtime uses session elapsed ticks, not a full minute for a late join', async () => {
  await fixture();system.tick(1100);const late=new MockPlayer('late');join(late);system.tick(100);
  assert.equal(profile(late).stats.playTicks,100);
});
test('simulation: death statistics are real profile mutations', async () => {
  const p=await fixture();world.afterEvents.entityDie.emit({deadEntity:p,damageSource:{}});assert.equal(profile(p).stats.deaths,1);
});
