import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

const publicRoutes = ['/login', '/auth/callback'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  // "undefined" means the session is still being determined.
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!router.isReady || session === undefined) return;
    if (!session && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
    } else if (session && router.pathname === '/login') {
      router.push('/');
    }
  }, [router.isReady, session, router.pathname]);

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
