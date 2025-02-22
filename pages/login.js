import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // new state for password
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use password-based sign in instead of magic link
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(error.message);
      } else {
        router.push('/');
      }
    } catch (error) {
      alert('Error signing in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="newspaper-container">
        <div className="max-w-md mx-auto px-4">
          <header className="text-center mb-6 md:mb-8">
            <h1 className="newspaper-headline mb-3 md:mb-4">The Topics Discussion</h1>
            <p className="font-serif text-sm md:text-base text-gray-400">
              Sign in with your email and password
            </p>
          </header>

          <div className="bg-gray-800 border border-gray-700 p-4 md:p-8">
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block font-serif text-base md:text-lg mb-2 text-gray-200">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="newspaper-input border"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-serif text-base md:text-lg mb-2 text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="newspaper-input border"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="newspaper-button w-full mt-2" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
