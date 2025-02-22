import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced storage with fallback mechanisms
const enhancedStorage = {
  getItem: (key) => {
    try {
      // Try localStorage first
      const localValue = localStorage.getItem(key);
      if (localValue) return localValue;

      // Try sessionStorage as fallback
      const sessionValue = sessionStorage.getItem(key);
      return sessionValue;
    } catch (error) {
      console.error('Storage access error:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      // Try to store in both storages
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage write error:', error);
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        console.error('All storage failed:', e);
      }
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removal error:', error);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: enhancedStorage,
    storageKey: 'sb-session',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    retryAttempts: 3,
    cookieOptions: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    }
  }
});

// More reliable session validation
export const getValidSession = async () => {
  try {
    // First try getting from storage
    const storedSession = enhancedStorage.getItem('sb-session');
    
    // If no stored session, get fresh session
    if (!storedSession) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }

    // If stored session exists, verify it
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      // Invalid session, try refreshing
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }

    return JSON.parse(storedSession);
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Helper to check routes
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
