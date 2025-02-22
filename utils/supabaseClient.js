import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced storage with session recovery
const enhancedStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Parse the stored session
      const parsed = JSON.parse(item);
      
      // If it's not the session item, return as is
      if (!key.includes('supabase.auth.token')) {
        return item;
      }

      // Check if session exists and is not expired
      if (parsed?.expires_at && parsed.expires_at < Date.now() / 1000) {
        localStorage.removeItem(key);
        return null;
      }

      return item;
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
    detectSessionInUrl: false,
    storage: enhancedStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
});

// Enhanced session validation
export const getValidSession = async () => {
  try {
    // First check if we have a session in storage
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) {
      return null;
    }

    // Verify the session is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Session is invalid, clean up
      await supabase.auth.signOut();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    // On error, clean up and return null
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    return null;
  }
};

// Add a helper to check if the current page is a public route
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
