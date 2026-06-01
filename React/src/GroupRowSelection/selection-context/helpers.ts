export function serializeKey(key: any): string {
  if (typeof key === 'string' || typeof key === 'number') {
    return String(key);
  }
  return JSON.stringify(key, Object.keys(key).sort());
}
