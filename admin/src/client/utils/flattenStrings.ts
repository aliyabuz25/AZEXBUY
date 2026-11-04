/**
 * Nested UI_STRINGS objesini flat dot-notation key formatına çevirir.
 * Örn: { hero: { title: 'X' } } → { 'hero.title': 'X' }
 * Array'ler: { whyAzexbuy: { items: [{ title: 'X' }] } } → { 'whyAzexbuy.items[0].title': 'X' }
 */
export function flattenStrings(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val)) {
      val.forEach((item: any, i: number) => {
        if (typeof item === 'object' && item !== null) {
          const nested = flattenStrings(item, `${fullKey}[${i}]`);
          Object.assign(result, nested);
        } else {
          result[`${fullKey}[${i}]`] = String(item);
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      const nested = flattenStrings(val, fullKey);
      Object.assign(result, nested);
    } else {
      result[fullKey] = String(val ?? '');
    }
  }
  return result;
}
