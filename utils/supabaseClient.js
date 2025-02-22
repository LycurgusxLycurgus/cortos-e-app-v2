import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This client should only be used in client components
export const supabase = createClientComponentClient();

// Enhanced session validation with timeout
export const getValidSession = async () => {
  try {
    // Set a timeout for the session check
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 2000);
    });

    const sessionPromise = supabase.auth.getSession();
    
    // Race between timeout and session check
    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]);

    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    // Force sign out on timeout or error
    await supabase.auth.signOut();
    return null;
  }
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
