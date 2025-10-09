import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase'; // Now this points to YOUR real Firebase

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

  // Convert Firebase user to our User interface
  const firebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        nickname: userData?.nickname || firebaseUser.displayName || undefined,
        tags: userData?.tags || [],
        createdAt: userData?.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      // If Firestore fails, return basic user info
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        createdAt: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    // Firebase Auth State Listener - REAL AUTH NOW!
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          console.log('User signed in:', firebaseUser.email);
          const appUser = await firebaseUserToAppUser(firebaseUser);
          setUser(appUser);
        } else {
          console.log('User signed out');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe; // Cleanup listener
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest automatically
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, nickname?: string) => {
    setLoading(true);
    try {
      // 1. Create REAL Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Update profile if nickname provided
      if (nickname) {
        await updateProfile(firebaseUser, {
          displayName: nickname
        });
      }

      // 3. Create user document in Firestore
      const userData = {
        email,
        nickname: nickname || null,
        tags: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      console.log('User created successfully:', email);
      // onAuthStateChanged will handle setting the user state
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null
    } catch (error: any) {
      console.error('Logout error:', error);
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
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An unexpected error occurred';
  }
}
