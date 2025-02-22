import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, getValidSession, isPublicRoute } from '../utils/supabaseClient';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(undefined);
  const [isNavigating, setIsNavigating] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const initializeAuth = async () => {
      try {
        const currentSession = await getValidSession();
        if (mounted) {
          setSession(currentSession);
          // Reset retry count on success
          retryCount = 0;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted && retryCount < maxRetries) {
          // Retry with exponential backoff
          setTimeout(initializeAuth, Math.pow(2, retryCount) * 1000);
          retryCount++;
        } else if (mounted) {
          // Max retries reached, force logout
          setSession(null);
          if (!isPublicRoute(router.pathname)) {
            router.push('/login');
          }
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            setSession(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const validSession = await getValidSession();
            setSession(validSession);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!router.isReady || session === undefined || isNavigating) return;

    const handleNavigation = async () => {
      try {
        setIsNavigating(true);
        await new Promise(resolve => setTimeout(resolve, 150)); // slightly longer delay

        if (!session && !isPublicRoute(router.pathname)) {
          await router.replace('/login');
        } else if (session && router.pathname === '/login') {
          await router.replace('/');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        setAuthError(error);
      } finally {
        setIsNavigating(false);
      }
    };

    handleNavigation();
  }, [router.isReady, session, router.pathname]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">An error occurred during authentication:</p>
          <pre className="text-red-400">{authError.message}</pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
