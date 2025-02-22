import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add retry mechanism for session validation
const getValidSessionWithRetry = async (retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session) return session;
      // If no session but still have retries, wait briefly and try again
      if (i < retries - 1) await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error(`Session validation attempt ${i + 1} failed:`, error);
      if (i === retries - 1) return null;
    }
  }
  return null;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          // Add validation for stored session
          if (key.includes('auth') && item) {
            try {
              const parsed = JSON.parse(item);
              if (!parsed || !parsed.access_token) return null;
            } catch {
              return null;
            }
          }
          return item;
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  }
});

// Export the enhanced session validator
export const getValidSession = getValidSessionWithRetry;
