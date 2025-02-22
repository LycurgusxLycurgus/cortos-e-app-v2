import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase, isPublicRoute } from '../utils/supabaseClient';

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Simple route protection without state
    if (!isPublicRoute(router.pathname)) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push('/login');
        }
      });
    }
  }, [router.pathname]);

  return children;
}
