import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SplashScreenController } from '@/components/SplashScreenController';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  // Set up the auth context and render our layout inside of it.
  return (
    <AuthProvider>
      <SplashScreenController />
      <RootNavigator />
    </AuthProvider>
  );
}

// Separate this into a new component so it can access the AuthProvider context later
function RootNavigator() {
  const { user, session } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Public routes - accessible to unauthenticated users */}
        <Stack.Protected guard={!user || !session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Protected routes - only accessible to authenticated users */}
        <Stack.Protected guard={!!user && !!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
