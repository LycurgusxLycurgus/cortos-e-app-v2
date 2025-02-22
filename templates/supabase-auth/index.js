// auth-lib/index.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuthGuard } from './guard';
import { createServerSupabaseClient } from './server';

/**
 * Creates a client-side Supabase client with cookie-based storage.
 * Options may be provided to override default cookie settings.
 */
export const createClient = (options = {}) => {
  return createClientComponentClient({
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      ...options.cookieOptions,
    },
    ...options,
  });
};

/**
 * Retrieves the current session from the given Supabase client.
 * @param {object} supabaseClient - The Supabase client instance.
 * @returns {Promise<object|null>} The session object or null.
 */
export const getValidSession = async (supabaseClient) => {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
  return session;
};

/**
 * Determines whether a given pathname is considered public.
 * @param {string} pathname - The current route pathname.
 * @returns {boolean} True if public; false otherwise.
 */
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};

// Re-export server and guard utilities for convenience.
export { createServerSupabaseClient } from './server';
export { AuthGuard } from './guard';
