import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Medium': require('../Poppins-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack>
      {/* Screen 1: No header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Screen 2: Transparent header with back button */}
      <Stack.Screen
        name="onboarding-two"
        options={{
          headerTransparent: true,
          headerTitle: '',
          // headerBackTitleVisible: false,
        }}
      />

      {/* --- THIS IS THE NEW PART --- */}
      {/* Screen 3: Transparent header with back button */}
      <Stack.Screen
        name="onboarding-three"
        options={{
          headerTransparent: true,
          headerTitle: '',
          // headerBackTitleVisible: false,
        }}
      />
      
      {/* Main App: No header */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

