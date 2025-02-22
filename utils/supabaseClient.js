import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Remove the cookie domain option so the client uses the current host automatically.
const cookieOptions =
  process.env.NODE_ENV === 'production'
    ? {
        secure: true,
        sameSite: 'none'
      }
    : {
        secure: false,
        sameSite: 'lax'
      };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    cookieOptions
  }
});
