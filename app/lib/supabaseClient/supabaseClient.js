// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Hard fail early with a descriptive message
if (!url || !anon) {
  // This will show a readable error in your console instead of "{}"
  throw new Error(
    `Missing Supabase env vars. Got URL="${url}" ANON="${anon ? '***set***' : ''}". 
    Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
    and that you restarted the dev server.`
  );
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: { params: { eventsPerSecond: 5 } },
});
