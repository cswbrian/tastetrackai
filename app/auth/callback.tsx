import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have tokens in the URL fragment
        const urlFragment = params['#'] as string;
        if (urlFragment) {
          // Parse the fragment to extract tokens
          const fragmentParams = new URLSearchParams(urlFragment);
          const accessToken = fragmentParams.get('access_token');
          const refreshToken = fragmentParams.get('refresh_token');
          
          if (accessToken) {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session:', error);
              router.replace('/(auth)/login');
              return;
            }
            
            if (data.session) {
              router.replace('/(tabs)');
              return;
            }
          }
        }
        
        // Fallback: Check if there's already a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/(auth)/login');
          return;
        }

        if (data.session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [router, params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Completing sign in...</Text>
    </View>
  );
} 