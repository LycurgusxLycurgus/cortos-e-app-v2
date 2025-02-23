import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import AuthGuard from '../components/AuthGuard';
import { useRouter } from 'next/router';
import { isPublicRoute, ensureProfile } from '../utils/supabaseClient';

function MyApp({ Component, pageProps }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let initTimer;

    const initializeAuth = async () => {
      try {
        // Set a maximum initialization time of 6 seconds
        const timeoutPromise = new Promise((_, reject) => {
          initTimer = setTimeout(() => {
            reject(new Error('Auth initialization timeout'));
          }, 6000);
        });

        // Race between auth initialization and timeout
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);

        if (mounted && session?.user) {
          // Ensure profile exists when session is valid
          await ensureProfile(session.user);
          
          if (isPublicRoute(router.pathname)) {
            router.push('/');
          }
        } else if (mounted && !session && !isPublicRoute(router.pathname)) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted && !isPublicRoute(router.pathname)) {
          router.push('/login');
        }
      } finally {
        if (mounted) {
          clearTimeout(initTimer);
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Simplified auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (event === 'SIGNED_IN' && isPublicRoute(router.pathname)) {
          router.push('/');
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(initTimer);
      subscription?.unsubscribe();
    };
  }, [router]);

  // Show loading state with a message that changes after 3 seconds
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <LoadingMessage />
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

// Separate component to handle loading message state
function LoadingMessage() {
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExtendedMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <p className="mt-4">
      {showExtendedMessage 
        ? "Still working... Please wait a moment."
        : "Initializing..."}
    </p>
  );
}

export default MyApp;
