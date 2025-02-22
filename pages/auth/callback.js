import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Use getSessionFromUrl to parse the session from the magic link URL.
      const { data: { session }, error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        console.error('Error retrieving session from URL:', error);
      }
      // Redirect to login (which will then immediately push authenticated users to the root)
      router.push('/login');
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
