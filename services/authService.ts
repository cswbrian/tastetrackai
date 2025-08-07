import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async signInWithGoogle(): Promise<{ data: { url: string | null }, error: Error | null }> {
    try {
      // For React Native, we need to use a different approach
      if (Platform.OS !== 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'tastetrackai://auth/callback',
            skipBrowserRedirect: true, // Important for React Native
          },
        });
        
        if (error) {
          throw error;
        }
        
        // Open the URL in a web browser
        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            'tastetrackai://auth/callback'
          );
          
          if (result.type === 'success') {
            // The auth state change listener will handle the session
            return { data: { url: null }, error: null };
          } else if (result.type === 'cancel') {
            return { data: { url: null }, error: new Error('User cancelled sign in') };
          } else {
            return { data: { url: null }, error: new Error(`OAuth flow failed: ${result.type}`) };
          }
        } else {
          return { data: { url: null }, error: new Error('No OAuth URL received') };
        }
      } else {
        // Web implementation - let Supabase handle the redirect
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) {
          return { data: { url: null }, error };
        }
        
        return { data, error: null };
      }
    } catch (error) {
      return { data: { url: null }, error: error as Error };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user as User | null;
  },

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
}; 