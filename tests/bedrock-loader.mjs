// Node-only resolution of API imports to explicit simulation doubles. Not shipped.
export async function resolve(specifier, context, nextResolve) {
  const stubs = { '@minecraft/server': './mocks/server.js', '@minecraft/server-ui': './mocks/server-ui.js' };
  if (Object.hasOwn(stubs, specifier)) return { url: new URL(stubs[specifier], import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
}
