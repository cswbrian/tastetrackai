import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={textColor} />
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
}); 