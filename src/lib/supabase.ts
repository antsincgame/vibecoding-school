// Re-export from shared package for backward compatibility
import { getSupabase, getAccount } from '@vibecoding/shared';

export const supabase = getSupabase();
export { getAccount };
