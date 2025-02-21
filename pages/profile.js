import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        alert('Error updating profile!');
      } else {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating profile!');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="newspaper-container">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 border-b-2 border-black pb-4">
            <h1 className="newspaper-headline">Your Profile</h1>
          </header>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <label className="block font-serif text-lg mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="newspaper-input"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block font-serif text-lg mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  name="avatar_url"
                  value={profile.avatar_url}
                  onChange={handleChange}
                  className="newspaper-input"
                  placeholder="https://example.com/your-photo.jpg"
                />
                {profile.avatar_url && (
                  <div className="mt-2">
                    <img
                      src={profile.avatar_url}
                      alt="Profile preview"
                      className="w-20 h-20 object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=Error';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-serif text-lg mb-2">
                  About You
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="newspaper-input"
                  rows="4"
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button 
                  onClick={updateProfile}
                  className="newspaper-button"
                >
                  Save Profile
                </button>
                <p className="mt-4 text-sm text-gray-400 font-serif">
                  Your profile information helps other members of the community get to know you better.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
