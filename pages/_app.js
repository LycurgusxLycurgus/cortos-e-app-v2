import '../styles/globals.css';
import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import AuthGuard from '../components/AuthGuard';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-red-500">Something went wrong:</p>
      <pre className="text-white">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Force a session refresh on app mount
    const refreshSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await supabase.auth.getSession(); // Trigger internal session detection
    };
    refreshSession();

    // Handle initial user profile sync
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await createOrUpdateProfile(session.user);
      }
    };
    initializeUser();

    // Listen for sign-in events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await createOrUpdateProfile(session.user);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
        if (upsertError) {
          console.error('Error upserting profile:', upsertError);
        }
      } else if (fetchError) {
        console.error('Error fetching profile:', fetchError);
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </ErrorBoundary>
  );
}

export default MyApp;
