import { useStorageState } from '@/hooks/useStorageState';
import { authService } from '@/services/authService';
import { User } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import React, { createContext, use, type PropsWithChildren } from 'react';

interface AuthContextType {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signInWithGoogle: async () => {},
  signOut: async () => {},
  session: null,
  user: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />');
  }
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, sessionToken], setSessionToken] = useStorageState('session');
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  // Initialize auth state from stored token
  React.useEffect(() => {
    const initializeAuth = async () => {
      if (sessionToken) {
        try {
          // Try to get current session and user
          const [currentUser, currentSession] = await Promise.all([
            authService.getCurrentUser(),
            authService.getCurrentSession(),
          ]);
          
          if (currentUser && currentSession) {
            setUser(currentUser);
            setSession(currentSession);
          } else {
            // Token is invalid, clear it
            setSessionToken(null);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          setSessionToken(null);
        }
      }
    };

    if (!isLoading) {
      initializeAuth();
    }
  }, [sessionToken, isLoading, setSessionToken]);

  // Set up auth state change listener
  React.useEffect(() => {
    let subscription: any;

    const setupAuthListener = async () => {
      const { data: { subscription: sub } } = await authService.onAuthStateChange(
        async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            setSession(newSession);
            setUser(newSession.user as User);
            // Store session token securely
            setSessionToken(newSession.access_token);
          } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user as User);
              setSessionToken(newSession.access_token);
            } else {
              setUser(null);
              setSession(null);
              setSessionToken(null);
            }
          }
          setIsSigningIn(false);
        }
      );
      subscription = sub;
    };

    setupAuthListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [setSessionToken]);

  const signInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { data, error } = await authService.signInWithGoogle();
      if (error) throw error;
      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsSigningIn(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setSessionToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signInWithGoogle,
        signOut,
        session,
        user,
        isLoading: isLoading || isSigningIn,
      }}>
      {children}
    </AuthContext.Provider>
  );
} 