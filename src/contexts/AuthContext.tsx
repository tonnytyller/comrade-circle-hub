import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  nickname?: string;
  tags?: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user to our User interface
  const supabaseUserToAppUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Get additional user data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        nickname: profile?.nickname || undefined,
        tags: profile?.tags || [],
        createdAt: profile?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      // If profile fetch fails, return basic user info
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        createdAt: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabaseUserToAppUser(session.user).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const appUser = await supabaseUserToAppUser(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, nickname?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nickname: nickname || null,
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper function for user-friendly error messages
function getAuthErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please confirm your email address';
  }
  if (errorMessage.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (errorMessage.includes('Password should be at least')) {
    return 'Password should be at least 6 characters';
  }
  return 'An unexpected error occurred';
}
