import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(undefined);
  const [authenticated, setAuthenticated] = useState(false);

  // Initial session check and auth state subscription
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setAuthenticated(!!session);
      } catch (error) {
        console.error('Session check error:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener with explicit event handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
      }
    });

    getSession();
    return () => subscription?.unsubscribe();
  }, []);

  // Handle redirects only when router is ready and session is determined
  useEffect(() => {
    if (!router.isReady || session === undefined) return;
    
    if (!authenticated && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
    } else if (authenticated && router.pathname === '/login') {
      router.push('/');
    }
  }, [router.isReady, session, authenticated, router.pathname]);

  // Show loading state only while determining initial session
  if (session === undefined && loading) {
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
