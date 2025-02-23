import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This client should only be used in client components
export const supabase = createClientComponentClient({
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

// Add this new function to create a profile
export const ensureProfile = async (user) => {
  if (!user) return null;

  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) return existingProfile;

    // If no profile exists, create one
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous', // Default username from email
          avatar_url: null,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return newProfile;
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
    return null;
  }
};

// Modify getValidSession to automatically ensure profile exists
export const getValidSession = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) return null;
      
      // Ensure profile exists for the user
      await ensureProfile(session.user);
      
      return session;
    } catch (error) {
      console.error(`Session validation attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        await supabase.auth.signOut();
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return null;
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  return publicRoutes.includes(pathname);
};
