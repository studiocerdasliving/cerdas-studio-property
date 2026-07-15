export const actionRegistry = {};

export function getAction(name) {
  if (!name) return null;
  return actionRegistry[name] || null;
}
