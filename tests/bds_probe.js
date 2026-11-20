// Test-only script, staged by tools/bds_probe.py. Never included in a release pack.
import { world, system, ItemStack } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { ProfileRepository } from './core/data_manager.js';
import { claimQuest } from './domain/progression.js';
import { EconomyService } from './systems/economy.js';
import { CONFIG } from './core/configuration.js';
import { requireServerOrigin } from './core/security.js';

system.afterEvents.scriptEventReceive.subscribe(event => {
  if (event.id !== 'wolfverse_qa:run') return;
  requireServerOrigin(event);
  const phase = Number(event.message), checks = [];
  function check(name, condition) { checks.push({ name, passed: !!condition }); }
  system.runTimeout(() => {
    let entity, chest, deathCallback;
    try {
      const previous = world.getDynamicProperty('wolfverse:qa_persistence');
      check('world_dynamic_property_restart', phase === 1 ? previous === undefined : previous === 'phase-1');
      world.setDynamicProperty('wolfverse:qa_persistence', 'phase-' + phase);
      check('codex_item_registered', new ItemStack(CONFIG.codexId, 1).typeId === CONFIG.codexId);
      check('ui_binding_constructs_not_renders', new ActionFormData().title('QA').button('Test') !== undefined);
      const dimension = world.getDimension('overworld');
      entity = dimension.spawnEntity('minecraft:zombie', { x: 2, y: 70, z: 2 });
      const repository = new ProfileRepository();
      const p = repository.read(entity);
      check('entity_dynamic_profile_creation', p.schemaVersion === 2 && p.coins === 0);
      repository.update(entity, data => { data.quest.progress = 3; claimQuest(data, CONFIG.questId); });
      check('entity_dynamic_profile_roundtrip', repository.read(entity).coins === 30);
      chest = dimension.getBlock({ x: 5, y: 70, z: 5 });
      chest.setType('minecraft:chest');
      const container = chest.getComponent('minecraft:inventory').container;
      const economy = new EconomyService(repository, { addOne(_actor, type) { return container.addItem(new ItemStack(type, 1)) === undefined; } });
      const token = economy.issue(entity, 'bread');
      const bought = economy.purchase(entity, 'bread', token);
      check('real_container_purchase', bought.delivered && repository.read(entity).coins === 25 && container.getItem(0)?.typeId === 'minecraft:bread');
      let refused = false;
      try { economy.purchase(entity, 'bread', token); } catch { refused = true; }
      check('duplicate_intent_refused_in_engine', refused && repository.read(entity).coins === 25);
      for (let i = 0; i < container.size; i++) container.setItem(i, new ItemStack('minecraft:cobblestone', 64));
      const full = economy.purchase(entity, 'bread', economy.issue(entity, 'bread'));
      check('real_full_container_refund', !full.delivered && repository.read(entity).coins === 25 && !repository.read(entity).pendingPurchase);
      deathCallback = world.afterEvents.entityDie.subscribe(death => {
        if (death.deadEntity.id !== entity.id) return;
        try {
          const location = death.deadEntity.location;
          check('dead_entity_id_type_location_access', death.deadEntity.typeId === 'minecraft:zombie' && Number.isFinite(location.x));
        } catch { check('dead_entity_id_type_location_access', false); }
      });
      entity.kill();
    } catch (error) {
      checks.push({ name: 'unexpected_engine_exception', passed: false, detail: String(error).slice(0, 350) });
    }
    system.runTimeout(() => {
      if (deathCallback) world.afterEvents.entityDie.unsubscribe(deathCallback);
      try { if (entity?.isValid) entity.remove(); } catch {}
      try { chest?.setType('minecraft:air'); } catch {}
      check('death_event_received', checks.some(c => c.name === 'dead_entity_id_type_location_access'));
      console.warn('[WOLFVERSE_QA] RESULT ' + JSON.stringify({ phase, passed: checks.length >= 10 && checks.every(c => c.passed), checks }));
    }, 20);
  }, 60);
});
console.warn('[WOLFVERSE_QA] LOADED test-only');
