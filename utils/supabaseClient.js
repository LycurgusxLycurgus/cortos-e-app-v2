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
      if (key.includes('auth') && parsed?.expires_at) {
        // Check if token is close to expiring (within 5 minutes)
        const expiresAt = new Date(parsed.expires_at * 1000);
        const now = new Date();
        if (expiresAt < now) {
          localStorage.removeItem(key);
          return null;
        }
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
    storageKey: 'auth-storage',
    flowType: 'pkce'
  }
});

// Enhanced session validation
export const getValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session) {
      // Verify token expiration
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      
      // If token is close to expiring (within 5 minutes), refresh it
      if ((expiresAt.getTime() - now.getTime()) < 300000) {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        return refreshedSession;
      }
    }
    
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    // Clear potentially corrupted session data
    await supabase.auth.signOut();
    return null;
  }
};

// Add session recovery helper
export const recoverSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      await supabase.auth.signOut();
      return null;
    }
    return session;
  } catch (error) {
    console.error('Session recovery error:', error);
    return null;
  }
};
