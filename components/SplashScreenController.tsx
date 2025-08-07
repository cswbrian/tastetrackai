import { SplashScreen } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function SplashScreenController() {
  const { isLoading } = useAuth();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
} 