export const CONFIG = Object.freeze({
  version: '0.1.0', profileKey: 'wolfverse:profile', maxProfileBytes: 8192,
  maxCoins: 1_000_000_000, maxXp: 1_000_000_000, maxLevel: 100, xpCurveFactor: 50, killDistance: 48,
  xpPerKill: 12, killSpacingMs: 2000, killWindowMs: 60000, maxRewardedKills: 8,
  questId: 'first_watch_v1', questTarget: 3, questXp: 75, questCoins: 30,
  intentTtlMs: 30000, maxIntents: 128, maxHistory: 12, hudIntervalTicks: 20,
  playtimeFlushTicks: 1200, codexId: 'wolfverse:codex',
  hostileTypes: Object.freeze(['minecraft:zombie', 'minecraft:husk', 'minecraft:drowned',
    'minecraft:skeleton', 'minecraft:stray', 'minecraft:spider', 'minecraft:cave_spider', 'minecraft:creeper']),
  ranks: Object.freeze([[100, 'Legendär'], [75, 'Meister'], [50, 'Elite'], [25, 'Veteran'], [10, 'Abenteurer'], [1, 'Anfänger']]),
  products: Object.freeze({ bread: Object.freeze({ itemId: 'minecraft:bread', count: 1, price: 5, title: 'Brot' }) })
});
