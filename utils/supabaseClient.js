import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This client should only be used in client components
export const supabase = createClientComponentClient();

// Helper to check if route is public
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};

// Simplified session validation
export const getValidSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
