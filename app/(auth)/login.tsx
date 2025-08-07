import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      Alert.alert(
        'Sign In Error',
        err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: textColor }]}>🍽️</Text>
          <Text style={[styles.appName, { color: textColor }]}>TasteTrack AI</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 