import '../styles/globals.css'
import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import AuthGuard from '../components/AuthGuard'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Handle initial session
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await createOrUpdateProfile(session.user);
      }
    };
    initializeUser();

    // Listen for sign-in events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await createOrUpdateProfile(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const createOrUpdateProfile = async (user) => {
    try {
      // First try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        // Create new profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            avatar_url: null,
            bio: null,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  return (
    <AuthGuard>
      <Component {...pageProps} />
    </AuthGuard>
  )
}

export default MyApp;
