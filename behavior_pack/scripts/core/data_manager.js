import { CONFIG } from './configuration.js';
import { requireThat } from './errors.js';
import { clone, decodeProfile, makeId, utf8Bytes, validateProfile } from '../domain/profile.js';
export class ProfileRepository {
  constructor(options = {}) { this.key = options.key ?? CONFIG.profileKey; this.now = options.now ?? (() => Date.now()); this.idFactory = options.idFactory ?? makeId; this.locks = new Set(); }
  read(player) {
    const raw = player.getDynamicProperty(this.key);
    const decoded = decodeProfile(raw, this.idFactory, this.now());
    if (decoded.write) this.write(player, decoded.profile);
    return clone(decoded.profile);
  }
  write(player, profile) {
    validateProfile(profile);
    const data = JSON.stringify(profile);
    requireThat(utf8Bytes(data) <= CONFIG.maxProfileBytes, 'profile_size_limit');
    player.setDynamicProperty(this.key, data);
  }
  update(player, mutate, expectedRevision = undefined) {
    requireThat(!this.locks.has(player.id), 'profile_busy');
    this.locks.add(player.id);
    try {
      const profile = this.read(player);
      const original = { revision: profile.revision, profileId: profile.profileId, createdAt: profile.createdAt };
      if (expectedRevision !== undefined) requireThat(original.revision === expectedRevision, 'stale_revision');
      requireThat(mutate.constructor?.name !== 'AsyncFunction', 'async_profile_mutation');
      const result = mutate(profile);
      requireThat(!result || typeof result.then !== 'function', 'async_profile_mutation');
      requireThat(profile.revision === original.revision && profile.profileId === original.profileId && profile.createdAt === original.createdAt, 'profile_identity_immutable');
      requireThat(original.revision < Number.MAX_SAFE_INTEGER, 'revision_limit');
      profile.revision = original.revision + 1;
      this.write(player, profile);
      return clone(profile);
    } finally { this.locks.delete(player.id); }
  }
}
