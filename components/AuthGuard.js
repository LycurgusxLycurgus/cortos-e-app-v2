import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Initial auth check
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

  // Listen for auth state changes with specific event handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setAuthenticated(true);
        // If on login page, redirect to home
        if (router.pathname === '/login') {
          router.push('/');
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        // If not on a public route, redirect to login
        if (!publicRoutes.includes(router.pathname)) {
          router.push('/login');
        }
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Handle redirects after router and auth are ready
  useEffect(() => {
    if (!router.isReady || loading) return;
    
    if (!authenticated && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
    } else if (authenticated && router.pathname === '/login') {
      router.push('/');
    }
  }, [router.isReady, loading, authenticated, router.pathname]);

  // Show loading state while determining auth
  if (loading || !router.isReady) {
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
