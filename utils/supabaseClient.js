import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For production, set NEXT_PUBLIC_COOKIE_DOMAIN to your deployed domain (e.g. ".yourdomain.com" or "yourapp.vercel.app")
const cookieOptions =
  process.env.NODE_ENV === 'production'
    ? {
        secure: true,
        sameSite: 'none',
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN // set this in Vercel env variables
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
