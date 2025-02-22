import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use window.localStorage if available, otherwise a dummy in-memory storage
const storage =
  typeof window !== 'undefined' && window.localStorage
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
        clear: () => null
      };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage
  }
});
