import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This client should only be used in client components
export const supabase = createClientComponentClient({
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

// Enhanced session validation with exponential backoff retry
export const getValidSession = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) return null;
      
      return session;
    } catch (error) {
      console.error(`Session validation attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        // On final retry, force sign out
        await supabase.auth.signOut();
        return null;
      }
      
      // Wait with exponential backoff before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return null;
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
