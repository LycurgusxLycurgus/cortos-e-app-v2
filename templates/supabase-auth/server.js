// auth-lib/server.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Creates a server-side Supabase client using cookies.
 * Use this in your server components or API routes.
 */
export const createServerSupabaseClient = (options = {}) =>
  createServerComponentClient({
    cookies,
    options: {
      cookieOptions: {
        name: 'sb-auth-token',
        lifetime: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        ...options.cookieOptions,
      },
      ...options,
    },
  });
