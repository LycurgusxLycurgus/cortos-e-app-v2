// auth-lib/guard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isPublicRoute, getValidSession } from './index';

/**
 * AuthGuard component to protect pages.
 * Expects a supabaseClient prop.
 */
export function AuthGuard({ children, supabaseClient }) {
  const router = useRouter();

  useEffect(() => {
    if (!isPublicRoute(router.pathname)) {
      getValidSession(supabaseClient).then((session) => {
        if (!session) {
          router.push('/login');
        }
      });
    }
  }, [router.pathname, supabaseClient]);

  return children;
}
