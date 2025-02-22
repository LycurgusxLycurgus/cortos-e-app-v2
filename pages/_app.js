import '../styles/globals.css';
import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import AuthGuard from '../components/AuthGuard';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Force a session refresh on app mount
    const refreshSession = async () => {
      // Wait a bit before forcing session detection
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
    <AuthGuard>
      <Component {...pageProps} />
    </AuthGuard>
  );
}

export default MyApp;
