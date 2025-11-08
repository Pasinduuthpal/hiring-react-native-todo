import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load TT Firs Neue fonts
  // If font files don't exist, this will fail at build time
  // Add the font files to assets/fonts/ directory to use the custom font
  const [fontsLoaded, fontError] = useFonts({
    'TTFirsNeue-Regular': require('../assets/fonts/TTFirsNeue-Regular.ttf'),
    'TTFirsNeue-Medium': require('../assets/fonts/TTFirsNeue-Medium.ttf'),
    'TTFirsNeue-Bold': require('../assets/fonts/TTFirsNeue-Bold.ttf'),
  });

  useEffect(() => {
    // Hide splash screen after a short delay or when fonts load
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
