import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, getValidSession } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(undefined);
  const [isNavigating, setIsNavigating] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await getValidSession();
        
        if (mounted) {
          setSession(currentSession);
          // Reset recovery attempts on successful session fetch
          setRecoveryAttempts(0);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          // Increment recovery attempts on failure
          setRecoveryAttempts(prev => prev + 1);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const validSession = await getValidSession();
          setSession(validSession);
          // Reset recovery attempts on successful auth state change
          setRecoveryAttempts(0);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Add recovery effect
  useEffect(() => {
    if (recoveryAttempts > 0 && recoveryAttempts < 3 && !session) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [recoveryAttempts, session]);

  useEffect(() => {
    if (!router.isReady || session === undefined || isNavigating) return;

    const handleNavigation = async () => {
      try {
        setIsNavigating(true);
        
        // Add delay to prevent rapid navigation
        await new Promise(resolve => setTimeout(resolve, 100));

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

  // Only show loading while determining initial session
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
