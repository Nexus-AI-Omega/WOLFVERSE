// Simulation only: these classes do NOT emulate Bedrock rendering/network/disk durability.
class Signal {
  constructor() { this.handlers = new Set(); }
  subscribe(fn) { this.handlers.add(fn); return fn; }
  unsubscribe(fn) { this.handlers.delete(fn); }
  emit(event) { for (const fn of [...this.handlers]) fn(event); }
  clear() { this.handlers.clear(); }
}
export const GameMode = { Survival: 'Survival', Creative: 'Creative', Adventure: 'Adventure', Spectator: 'Spectator' };
export class ItemStack {
  constructor(typeId, amount = 1) { this.typeId = typeId; this.amount = amount; this.maxAmount = typeId === 'wolfverse:codex' ? 1 : 64; }
}
export class MockContainer {
  constructor(size = 6) { this.size = size; this.slots = new Array(size); }
  getItem(slot) { const x = this.slots[slot]; return x ? new ItemStack(x.typeId, x.amount) : undefined; }
  setItem(slot, item) { this.slots[slot] = item ? new ItemStack(item.typeId, item.amount) : undefined; }
  addItem(item) {
    let left = item.amount;
    for (let i = 0; i < this.size; i++) {
      const existing = this.slots[i];
      if (existing?.typeId === item.typeId && existing.amount < item.maxAmount) {
        const n = Math.min(left, item.maxAmount - existing.amount); existing.amount += n; left -= n;
      }
      if (!left) return undefined;
    }
    for (let i = 0; i < this.size; i++) if (!this.slots[i]) {
      const n = Math.min(left, item.maxAmount); this.slots[i] = new ItemStack(item.typeId, n); left -= n;
      if (!left) return undefined;
    }
    return new ItemStack(item.typeId, left);
  }
  count(type) { return this.slots.filter(x => x?.typeId === type).reduce((sum, x) => sum + x.amount, 0); }
}
const intervalJobs = new Map(), nextJobs = [];
let jobId = 0;
export const mock = { players: [], components: new Map(), particles: [], sounds: [] };
export const system = {
  currentTick: 0,
  beforeEvents: { startup: new Signal() },
  afterEvents: { scriptEventReceive: new Signal() },
  run(fn) { nextJobs.push(fn); return ++jobId; },
  runInterval(fn, interval = 1) { const id = ++jobId; intervalJobs.set(id, { fn, interval, next: this.currentTick + interval }); return id; },
  tick(count = 1) {
    for (let n = 0; n < count; n++) {
      this.currentTick++;
      for (const fn of nextJobs.splice(0)) fn();
      for (const job of intervalJobs.values()) if (this.currentTick >= job.next) { job.next += job.interval; job.fn(); }
    }
  }
};
export const world = {
  afterEvents: { playerSpawn: new Signal(), playerLeave: new Signal(), entityDie: new Signal() },
  getAllPlayers() { return [...mock.players]; }
};
export class MockPlayer {
  constructor(id, data = new Map()) {
    this.id = id; this.typeId = 'minecraft:player'; this.name = 'Test ' + id; this.data = data; this.isValid = true;
    this.location = { x: 0, y: 64, z: 0 }; this.mode = GameMode.Survival; this.messages = []; this.hud = [];
    this.inventory = new MockContainer(); this.onScreenDisplay = { setActionBar: text => this.hud.push(text) };
    this.dimension = { spawnParticle: (name, location) => mock.particles.push({ name, location }) };
  }
  getDynamicProperty(key) { return this.data.get(key); }
  setDynamicProperty(key, value) { this.data.set(key, value); }
  getComponent(key) { if (key === 'minecraft:inventory') return { container: this.inventory }; }
  getGameMode() { return this.mode; }
  sendMessage(text) { this.messages.push(text); }
  playSound(name, options) { mock.sounds.push({ playerId: this.id, name, options }); }
}
export function join(player) { mock.players.push(player); world.afterEvents.playerSpawn.emit({ player, initialSpawn: true }); }
export function leave(player) {
  mock.players = mock.players.filter(x => x !== player); player.isValid = false; world.afterEvents.playerLeave.emit({ playerId: player.id });
}
export function reset() {
  for (const signal of Object.values(world.afterEvents)) signal.clear();
  system.beforeEvents.startup.clear(); system.afterEvents.scriptEventReceive.clear();
  intervalJobs.clear(); nextJobs.length = 0; system.currentTick = 0;
  mock.players = []; mock.components.clear(); mock.particles = []; mock.sounds = [];
}
