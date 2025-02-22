import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // (1) Run an initial auth check once on mount.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // (2) Listen for auth state changes once.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // (3) Once loading is done AND router is ready, handle redirection:
  //     - If not authenticated and on a protected route, send to /login.
  //     - If authenticated and on /login, push them to root.
  useEffect(() => {
    if (!router.isReady) return; // Wait until the router is ready
    if (!loading) {
      if (!authenticated && !publicRoutes.includes(router.pathname)) {
        router.push('/login');
      } else if (authenticated && router.pathname === '/login') {
        router.push('/');
      }
    }
  }, [router.isReady, loading, authenticated, router.pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
