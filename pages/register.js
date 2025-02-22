import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        alert("Registration successful! Please check your email to confirm your account.");
        router.push('/login');
      }
    } catch (error) {
      alert('Error registering: ' + error.message);
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
            <h1 className="newspaper-headline mb-3 md:mb-4">Register</h1>
            <p className="font-serif text-sm md:text-base text-gray-400">
              Create your account by providing your email and password
            </p>
          </header>
          <div className="bg-gray-800 border border-gray-700 p-4 md:p-8">
            <form onSubmit={handleRegister}>
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
              <div className="mb-4">
                <label className="block font-serif text-base md:text-lg mb-2 text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="newspaper-input border"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-serif text-base md:text-lg mb-2 text-gray-200">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="newspaper-input border"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button type="submit" className="newspaper-button w-full mt-2" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
