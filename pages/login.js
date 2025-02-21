import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [linkSent, setLinkSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        alert(error.message);
      } else {
        setLinkSent(true);
      }
    } catch (error) {
      alert('Error sending magic link: ' + error.message);
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
              Join our community of thoughtful discussions
            </p>
          </header>

          {!linkSent ? (
            <div className="bg-gray-800 border border-gray-700 p-4 md:p-8">
              <h2 className="newspaper-subheading mb-4 md:mb-6">Sign In to Participate</h2>
              <form onSubmit={handleSendMagicLink}>
                <div className="mb-4">
                  <label className="block font-serif text-base md:text-lg mb-2 text-gray-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="newspaper-input border"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="newspaper-button w-full mt-2"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 p-4 md:p-8 text-center">
              <h2 className="newspaper-subheading mb-3 md:mb-4">Check Your Inbox</h2>
              <p className="font-serif text-sm md:text-base text-gray-300 mb-4 md:mb-6">
                We've sent a magic link to <strong className="text-gray-100">{email}</strong>
              </p>
              <p className="font-serif text-sm md:text-base text-gray-300 mb-4 md:mb-6">
                Click the link in the email to sign in to your account.
              </p>
              <button
                onClick={() => setLinkSent(false)}
                className="text-gray-400 underline hover:text-gray-200 text-sm md:text-base"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
