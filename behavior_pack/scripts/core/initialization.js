import { world, system, ItemStack, GameMode } from '@minecraft/server';
import { CONFIG } from './configuration.js';
import { ProfileRepository } from './data_manager.js';
import { EventBus } from './event_manager.js';
import { errorCode, requireThat } from './errors.js';
import { requireServerOrigin } from './security.js';
import { levelFromXp } from '../domain/progression.js';
import { EconomyService } from '../systems/economy.js';
import { PlayerService } from '../systems/player_service.js';
import { MenuController, friendlyError } from '../ui/menu.js';

export function initialize() {
  const failures = new Map(), players = new Map(), profileIds = new Map(), seenKills = new Map(), effectsAt = new Map(), codexAt = new Map(), playSince = new Map();
  const onError = (where, error) => {
    const key = where + ':' + errorCode(error), now = Date.now();
    if (now - (failures.get(key) ?? 0) < 60000) return;
    if (failures.size >= 64) failures.delete(failures.keys().next().value);
    failures.set(key, now); console.error(`[WOLFVERSE] ${where} ${errorCode(error)}`);
  };
  const repository = new ProfileRepository();
  const bus = new EventBus(onError);
  const actions = new PlayerService(repository, bus);
  const inventory = { addOne(player, itemId) {
    const container = player.getComponent('minecraft:inventory')?.container;
    requireThat(!!container, 'inventory_missing');
    return container.addItem(new ItemStack(itemId, 1)) === undefined;
  } };
  const economy = new EconomyService(repository, inventory);
  const effects = (player, name) => {
    try {
      const p = repository.read(player), now = Date.now();
      if (now - (effectsAt.get(player.id) ?? 0) < 150) return;
      effectsAt.set(player.id, now);
      if (p.settings.sound) player.playSound('wolfverse.' + name, { volume: 0.35, pitch: 1 });
      if (name === 'level_up' && p.settings.quality === 'standard') player.dimension.spawnParticle('wolfverse:level_up', { ...player.location, y: player.location.y + 1 });
    } catch (error) { onError('effects', error); }
  };
  const menus = new MenuController(repository, economy, actions, effects, onError);
  bus.on('profile.changed', fact => { const player = players.get(fact.playerId); if (player?.isValid && fact.afterLevel > fact.beforeLevel) effects(player, 'level_up'); });

  function join(player, grantCodex = false) {
    try {
      players.set(player.id, player);
      if (!playSince.has(player.id)) playSince.set(player.id, system.currentTick);
      const p = repository.read(player); profileIds.set(player.id, p.profileId);
      if (grantCodex) {
        const container = player.getComponent('minecraft:inventory')?.container;
        if (container) {
          let found = false;
          for (let slot = 0; slot < container.size; slot++) if (container.getItem(slot)?.typeId === CONFIG.codexId) { found = true; break; }
          if (!found && container.addItem(new ItemStack(CONFIG.codexId, 1))) player.sendMessage('§bWOLFVERSE§r · Inventar voll. Der Codex lässt sich später herstellen.');
        }
      }
    } catch (error) { onError('profile_join', error); try { player.sendMessage('§bWOLFVERSE§r · ' + friendlyError(error)); } catch {} }
  }
  world.afterEvents.playerSpawn.subscribe(event => join(event.player, event.initialSpawn));
  world.afterEvents.playerLeave.subscribe(event => {
    const id = event.playerId, profileId = profileIds.get(id);
    if (profileId) economy.intents.clearOwner(profileId);
    players.delete(id); profileIds.delete(id); menus.leave(id); effectsAt.delete(id); codexAt.delete(id); playSince.delete(id);
  });
  for (const player of world.getAllPlayers()) join(player, true);

  world.afterEvents.entityDie.subscribe(event => {
    try {
      const dead = event.deadEntity;
      if (dead.typeId === 'minecraft:player') { actions.recordDeath(dead); return; }
      const killer = event.damageSource.damagingEntity;
      if (!killer || killer.typeId !== 'minecraft:player') return;
      const now = Date.now(), id = dead.id;
      if (seenKills.has(id)) return;
      for (const [key, expiry] of seenKills) if (expiry <= now) seenKills.delete(key);
      if (seenKills.size >= 256) seenKills.delete(seenKills.keys().next().value);
      seenKills.set(id, now + 120000);
      const player = /** @type {import('@minecraft/server').Player} */ (killer);
      if (!CONFIG.hostileTypes.includes(dead.typeId) || player.getGameMode() !== GameMode.Survival) return;
      const a = dead.location, b = player.location;
      const distance = Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z);
      actions.recordKill(player, { typeId: dead.typeId, survival: true, distance }, now);
    } catch (error) { onError('kill', error); }
  });

  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      try {
        const p = repository.read(player);
        if (!p.settings.hud) continue;
        const accent = p.settings.theme === 'green' ? '§a' : '§b';
        player.onScreenDisplay.setActionBar(`${accent}WOLFVERSE§r  Lv.${levelFromXp(p.xp)} · ${p.xp} XP · ${p.coins} Coins  §7| Wacht ${p.quest.progress}/${CONFIG.questTarget}${p.quest.claimed ? ' ✓' : ''}`);
      } catch (error) { onError('hud', error); }
    }
  }, CONFIG.hudIntervalTicks);
  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      try {
        const tick = system.currentTick, elapsed = Math.max(0, tick - (playSince.get(player.id) ?? tick));
        if (elapsed > 0) actions.addPlayTicks(player, elapsed);
        playSince.set(player.id, tick);
      }
      catch (error) { onError('playtime', error); }
    }
  }, CONFIG.playtimeFlushTicks);

  system.afterEvents.scriptEventReceive.subscribe(event => {
    try {
      if (event.id === 'wolfverse:menu') {
        if (event.sourceEntity?.typeId === 'minecraft:player') void menus.open(/** @type {import('@minecraft/server').Player} */(event.sourceEntity));
      } else if (event.id === 'wolfverse:status') {
        requireServerOrigin(event);
        console.warn('[WOLFVERSE] STATUS ' + JSON.stringify({ version: CONFIG.version, profiles: world.getAllPlayers().map(p => {
          const data = repository.read(p); return { profileId: data.profileId, pendingId: data.pendingPurchase?.id ?? null };
        }) }));
      } else if (event.id === 'wolfverse:resolve_purchase') {
        requireServerOrigin(event);
        requireThat(event.message.length <= 300, 'admin_input_limit');
        const request = JSON.parse(event.message);
        requireThat(typeof request.profileId === 'string' && typeof request.id === 'string' && ['refund','confirm'].includes(request.resolution), 'admin_input_invalid');
        const target = world.getAllPlayers().find(p => repository.read(p).profileId === request.profileId);
        requireThat(!!target, 'player_not_online');
        economy.resolveFromTrustedServer(target, request.id, request.resolution);
        console.warn('[WOLFVERSE] AUDIT purchase_resolved ' + request.resolution + ' ' + request.id);
      }
    } catch (error) { onError('script_event', error); }
  });
  console.warn('[WOLFVERSE] READY ' + CONFIG.version + ' core=stable-2.0 no-network');
  return { openMenu(player) {
    const now = Date.now(); if (now - (codexAt.get(player.id) ?? 0) < 500) return;
    codexAt.set(player.id, now); void menus.open(player);
  } };
}
