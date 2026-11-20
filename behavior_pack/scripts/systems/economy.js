import { CONFIG } from '../core/configuration.js';
import { WolfError, requireThat } from '../core/errors.js';
import { makeId } from '../domain/profile.js';

export class IntentStore {
  constructor(now = () => Date.now(), idFactory = makeId) { this.now = now; this.idFactory = idFactory; this.entries = new Map(); }
  issue(profileId, revision, sku) {
    const now = this.now();
    for (const [id, row] of this.entries) if (row.expiresAt <= now || row.profileId === profileId) this.entries.delete(id);
    requireThat(this.entries.size < CONFIG.maxIntents, 'intent_capacity');
    requireThat(Object.hasOwn(CONFIG.products, sku), 'product_unknown');
    const id = this.idFactory(); requireThat(!this.entries.has(id), 'intent_collision');
    this.entries.set(id, { profileId, revision, sku, issuedAt: now, expiresAt: now + CONFIG.intentTtlMs });
    return id;
  }
  consume(id, profileId, sku) {
    const row = this.entries.get(id); this.entries.delete(id);
    requireThat(!!row, 'intent_used_or_unknown');
    requireThat(row.profileId === profileId && row.sku === sku, 'intent_owner');
    requireThat(this.now() >= row.issuedAt && this.now() < row.expiresAt, 'intent_expired');
    return row;
  }
  clearOwner(profileId) { for (const [id, row] of this.entries) if (row.profileId === profileId) this.entries.delete(id); }
}

export class EconomyService {
  constructor(repository, inventory, intents = new IntentStore(), now = () => Date.now()) { this.repository = repository; this.inventory = inventory; this.intents = intents; this.now = now; }
  issue(player, sku) { const p = this.repository.read(player); requireThat(!p.pendingPurchase, 'purchase_pending'); return this.intents.issue(p.profileId, p.revision, sku); }
  purchase(player, sku, intentId) {
    const p = this.repository.read(player);
    const intent = this.intents.consume(intentId, p.profileId, sku);
    const product = CONFIG.products[sku];
    requireThat(!!product && product.count === 1 && Number.isSafeInteger(product.price) && product.price > 0, 'product_invalid');
    this.repository.update(player, profile => {
      requireThat(!profile.pendingPurchase, 'purchase_pending');
      requireThat(!profile.history.some(row => row.id === intentId), 'purchase_duplicate');
      requireThat(profile.coins >= product.price, 'coins_insufficient');
      profile.coins -= product.price;
      profile.pendingPurchase = { id: intentId, sku, price: product.price, startedAt: this.now() };
      profile.history.push({ id: intentId, sku, price: product.price, state: 'debited' });
      profile.history = profile.history.slice(-CONFIG.maxHistory);
    }, intent.revision);
    // No await between the accepted profile debit and inventory call. Crash/throw => pending, NOT automatic redelivery.
    let delivered;
    try { delivered = this.inventory.addOne(player, product.itemId); }
    catch { throw new WolfError('purchase_uncertain'); }
    requireThat(typeof delivered === 'boolean', 'purchase_uncertain');
    try {
      const updated = this.repository.update(player, profile => {
        requireThat(profile.pendingPurchase?.id === intentId, 'purchase_pending_mismatch');
        if (!delivered) { requireThat(profile.coins <= CONFIG.maxCoins - product.price, 'coins_limit'); profile.coins += product.price; }
        const row = profile.history.find(x => x.id === intentId); requireThat(!!row, 'purchase_journal_missing');
        row.state = delivered ? 'delivered' : 'refunded'; profile.pendingPurchase = null;
      });
      return { delivered, profile: updated };
    } catch { throw new WolfError('purchase_uncertain'); }
  }
  resolveFromTrustedServer(player, id, resolution) {
    requireThat(['refund', 'confirm'].includes(resolution), 'resolution_invalid');
    return this.repository.update(player, profile => {
      requireThat(profile.pendingPurchase?.id === id, 'purchase_pending_mismatch');
      const row = profile.history.find(x => x.id === id); requireThat(!!row, 'purchase_journal_missing');
      if (resolution === 'refund') {
        requireThat(profile.coins <= CONFIG.maxCoins - profile.pendingPurchase.price, 'coins_limit');
        profile.coins += profile.pendingPurchase.price;
      }
      row.state = resolution === 'refund' ? 'refunded' : 'delivered'; profile.pendingPurchase = null;
    });
  }
}
