// /lib/supabaseClient.js  (exact path & name)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // surface this loudly in the browser console
  console.error('[supabaseClient] Missing envs:', {
    NEXT_PUBLIC_SUPABASE_URL: !!url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anon,
  });
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
