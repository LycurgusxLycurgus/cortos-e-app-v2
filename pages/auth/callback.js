import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First exchange the code for a session
        await supabase.auth.exchangeCodeForSession(window.location.hash);
        
        // Clear the URL hash to prevent stale auth attempts
        window.history.replaceState(null, '', window.location.pathname);
        
        // Then get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error retrieving session:', error);
          router.push('/login');
          return;
        }

        // If we have a session, go to home, otherwise to login
        if (session) {
          router.push('/');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logging you in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
