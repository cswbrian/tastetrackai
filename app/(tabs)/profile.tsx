import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.title, { color: textColor }]}>Profile</Text>
          
          {user && (
            <View style={styles.userDetails}>
              <Text style={[styles.label, { color: textColor }]}>Email:</Text>
              <Text style={[styles.value, { color: textColor }]}>
                {user.email || 'No email provided'}
              </Text>
              
              <Text style={[styles.label, { color: textColor }]}>Name:</Text>
              <Text style={[styles.value, { color: textColor }]}>
                {user.user_metadata?.full_name || 'No name provided'}
              </Text>
              
              <Text style={[styles.label, { color: textColor }]}>Provider:</Text>
              <Text style={[styles.value, { color: textColor }]}>
                {user.user_metadata?.provider || 'Unknown'}
              </Text>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  userInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  userDetails: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 