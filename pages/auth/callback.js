import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Clear the URL hash to prevent stale auth attempts
      window.history.replaceState(null, '', window.location.pathname);
      
      // Get the session (it will be auto-detected from the URL thanks to detectSessionInUrl: true)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Error retrieving session:', error);
        router.push('/login');
        return;
      }

      // Redirect to home if session is present, otherwise back to login
      router.push('/');
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
