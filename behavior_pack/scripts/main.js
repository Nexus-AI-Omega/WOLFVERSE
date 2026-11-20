import { system } from '@minecraft/server';
import { initialize } from './core/initialization.js';
let runtime;
system.beforeEvents.startup.subscribe(event => {
  event.itemComponentRegistry.registerCustomComponent('wolfverse:open_codex', {
    onUse(event) { system.run(() => { if (event.source.isValid) runtime?.openMenu(event.source); }); }
  });
  console.warn('[WOLFVERSE] COMPONENT_REGISTERED wolfverse:open_codex');
});
system.run(() => {
  try { runtime = initialize(); }
  catch (error) { console.error('[WOLFVERSE] INIT_FAILED ' + (error?.name ?? 'Error')); }
});
