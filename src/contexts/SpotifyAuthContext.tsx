import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SpotifyAuthContextType {
  user: User | null;
  loading: boolean;
  signInWithSpotify: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);

export function SpotifyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithSpotify = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'user-read-email user-read-private'
      }
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <SpotifyAuthContext.Provider value={{ user, loading, signInWithSpotify, signOut }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
}

export function useSpotifyAuth() {
  const context = useContext(SpotifyAuthContext);
  if (!context) {
    throw new Error('useSpotifyAuth must be used within SpotifyAuthProvider');
  }
  return context;
}
