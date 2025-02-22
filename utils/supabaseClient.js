import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // When using SSR, this enables detection of the session in the URL and uses cookies
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Simplify getValidSession – now it simply returns the current session.
export const getValidSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
