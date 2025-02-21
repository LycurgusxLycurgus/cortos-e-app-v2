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
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') { // No profile exists
        // Use upsert instead of insert to handle race conditions
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            avatar_url: null,
            bio: null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: true
          });

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
  )
}

export default MyApp;
