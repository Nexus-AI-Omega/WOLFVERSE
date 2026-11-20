export class EventBus {
  constructor(onError = (_name, _error) => {}) { this.listeners = new Map(); this.onError = onError; }
  on(name, listener) {
    const set = this.listeners.get(name) ?? new Set(); set.add(listener); this.listeners.set(name, set);
    return () => { set.delete(listener); if (!set.size) this.listeners.delete(name); };
  }
  emit(name, payload) {
    for (const listener of [...(this.listeners.get(name) ?? [])]) {
      try { listener(Object.freeze({ ...payload })); } catch (error) { this.onError(name, error); }
    }
  }
}
