import { getSupabase } from '@vibecoding/shared';

const _raw = getSupabase();

function deepParseJsonStrings(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepParseJsonStrings);
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.length > 1) {
      const t = v.trim();
      if ((t[0] === '[' && t[t.length-1] === ']') || (t[0] === '{' && t[t.length-1] === '}')) {
        try { result[k] = JSON.parse(t); continue; } catch {}
      }
    }
    result[k] = v;
  }
  return result;
}

// Proxy that auto-parses JSON strings in results
export const supabase = {
  from: (table: string) => {
    const builder = _raw.from(table);
    return new Proxy(builder, {
      get(target: any, prop: string) {
        if (prop === 'then') {
          return (resolve: any, reject?: any) => {
            return target.then((result: any) => {
              if (result?.data) {
                if (Array.isArray(result.data)) {
                  result.data = result.data.map(deepParseJsonStrings);
                } else if (typeof result.data === 'object') {
                  result.data = deepParseJsonStrings(result.data);
                }
              }
              resolve(result);
            }, reject);
          };
        }
        const val = target[prop];
        if (typeof val === 'function') {
          return (...args: any[]) => {
            const res = val.apply(target, args);
            // If method returns the builder (chaining), return proxy
            if (res === target) return new Proxy(target, this);
            return res;
          };
        }
        return val;
      }
    });
  },
  auth: _raw.auth,
  storage: _raw.storage,
  rpc: _raw.rpc,
};
