import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import AuthGuard from '../components/AuthGuard';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          // No session, redirect to login if not on a public route
          if (!isPublicRoute(router.pathname)) {
            router.push('/login');
          }
        }

        // Initialize user profile if we have a session
        if (session?.user) {
          await createOrUpdateProfile(session.user);
        }

      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, redirect to login
        if (!isPublicRoute(router.pathname)) {
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_OUT') {
            router.push('/login');
          } else if (session?.user) {
            await createOrUpdateProfile(session.user);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setError(error);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const createOrUpdateProfile = async (user) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              avatar_url: null,
              bio: null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'id',
              ignoreDuplicates: true,
            }
          );
        if (upsertError) throw upsertError;
      } else if (fetchError) {
        throw fetchError;
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      setError(error);
    }
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Initializing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">Something went wrong:</p>
        <pre className="text-white">{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <Component {...pageProps} />
    </AuthGuard>
  );
}

export default MyApp;
