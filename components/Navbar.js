import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show navbar on login page
  if (router.pathname === '/login') return null;

  if (loading) {
    return <nav className="border-b-2 border-gray-700 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-gray-100">
            The Daily Discussion
          </Link>
        </div>
      </div>
    </nav>;
  }

  return (
    <nav className="border-b-2 border-gray-700 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <Link href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-100">
            The Topics Discussion
          </Link>
          <div className="flex items-center space-x-4 md:space-x-6">
            {user && (
              <>
                <Link 
                  href="/create" 
                  className="font-sans text-xs md:text-sm uppercase tracking-wider text-gray-300 hover:text-white"
                >
                  New Topic
                </Link>
                <Link 
                  href="/profile" 
                  className="font-sans text-xs md:text-sm uppercase tracking-wider text-gray-300 hover:text-white"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="font-sans text-xs md:text-sm uppercase tracking-wider text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
