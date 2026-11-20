export class WolfError extends Error {
  constructor(code, message = code) { super(message); this.name = 'WolfError'; this.code = code; }
}
export function requireThat(condition, code) { if (!condition) throw new WolfError(code); }
export function errorCode(error) { return error instanceof WolfError ? error.code : 'internal_error'; }
