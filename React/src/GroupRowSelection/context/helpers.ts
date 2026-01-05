export const serializeKey = (key: any) =>
  typeof key === "string" || typeof key === "number"
    ? String(key)
    : JSON.stringify(key, Object.keys(key).sort());
