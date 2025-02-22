import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced storage with fallback mechanisms
const enhancedStorage = {
  getItem: (key) => {
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) return localValue;
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Storage access error:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage write error:', error);
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

// Use a simple in-memory lock to avoid concurrent refreshes
let sessionRefreshInProgress = false;

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

export const getValidSession = async () => {
  try {
    // Use lock to prevent concurrent refresh attempts
    if (sessionRefreshInProgress) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    sessionRefreshInProgress = true;
    
    const storedSession = enhancedStorage.getItem('sb-session');
    if (!storedSession) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      sessionRefreshInProgress = false;
      return session;
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      sessionRefreshInProgress = false;
      return session;
    }
    sessionRefreshInProgress = false;
    return JSON.parse(storedSession);
  } catch (error) {
    console.error('Session validation error:', error);
    sessionRefreshInProgress = false;
    return null;
  }
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
