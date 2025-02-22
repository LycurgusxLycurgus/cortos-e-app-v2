import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Simple storage wrapper with error handling
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // <-- Changed from false to true
    storage: safeStorage
  }
});

// Simplified session validation that doesn't aggressively clear sessions
export const getValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Helper to check if the current page is a public route
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
