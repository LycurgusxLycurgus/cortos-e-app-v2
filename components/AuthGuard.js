import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(undefined);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Session fetch error:', error);
        setSession(null);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!router.isReady || session === undefined || isNavigating) return;

    const handleNavigation = async () => {
      try {
        setIsNavigating(true);
        if (!session && !publicRoutes.includes(router.pathname)) {
          await router.push('/login');
        } else if (session && router.pathname === '/login') {
          await router.push('/');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    };

    handleNavigation();
  }, [router.isReady, session, router.pathname]);

  if (session === undefined) {
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
