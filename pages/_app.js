import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import AuthGuard from '../components/AuthGuard';

function MyApp({ Component, pageProps }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Force a session refresh on app mount
    const refreshSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await supabase.auth.getSession(); // Trigger internal session detection
      } catch (error) {
        console.error('Session refresh error:', error);
        setError(error);
      }
    };
    refreshSession();

    // Handle initial user profile sync
    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await createOrUpdateProfile(session.user);
        }
      } catch (error) {
        console.error('User init error:', error);
        setError(error);
      }
    };
    initializeUser();

    // Listen for sign-in events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session?.user) {
            await createOrUpdateProfile(session.user);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setError(error);
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
        if (upsertError) throw upsertError;
      } else if (fetchError) {
        throw fetchError;
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      setError(error);
    }
  };

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
