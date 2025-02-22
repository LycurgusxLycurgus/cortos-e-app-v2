import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, isPublicRoute } from '../utils/supabaseClient';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && !isPublicRoute(router.pathname)) {
          router.push('/login');
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router.pathname]);

  if (isChecking) {
    return null; // Let _app.js handle the loading state
  }

  return children;
}
