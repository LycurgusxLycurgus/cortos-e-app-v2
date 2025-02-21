import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
        
        // Always redirect to /login if not authenticated
        if (!session && !publicRoutes.includes(router.pathname)) {
          router.push('/login');
          return;
        }
        
        // Only redirect to home if we're on login page and authenticated
        if (session && router.pathname === '/login') {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener with the same logic as checkAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      
      // Use the same redirect logic as checkAuth
      if (!session && !publicRoutes.includes(router.pathname)) {
        router.push('/login');
        return;
      }
      
      if (session && router.pathname === '/login') {
        router.push('/');
      }
    });

    checkAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If it's the login page and user is authenticated, show loading
  if (router.pathname === '/login' && authenticated) {
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