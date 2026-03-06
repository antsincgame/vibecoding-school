import { getSupabase } from '@vibecoding/shared';

const _supabase = getSupabase();

// Wrap to ensure JSON string fields (features, etc.) are always parsed
const originalFrom = _supabase.from.bind(_supabase);
_supabase.from = (table: string) => {
  const builder = originalFrom(table);
  const originalThen = builder.then?.bind(builder);
  if (originalThen) {
    builder.then = (resolve: any, reject?: any) => {
      return originalThen((result: any) => {
        if (result?.data) {
          const parse = (obj: any) => {
            if (!obj || typeof obj !== 'object') return obj;
            for (const [k, v] of Object.entries(obj)) {
              if (typeof v === 'string' && v.length > 1) {
                const c0 = v.charAt(0), cL = v.charAt(v.length - 1);
                if ((c0 === '[' && cL === ']') || (c0 === '{' && cL === '}')) {
                  try { (obj as any)[k] = JSON.parse(v); } catch {}
                }
              }
            }
            return obj;
          };
          if (Array.isArray(result.data)) {
            result.data = result.data.map(parse);
          } else {
            result.data = parse(result.data);
          }
        }
        resolve(result);
      }, reject);
    };
  }
  return builder;
};

export const supabase = _supabase;
