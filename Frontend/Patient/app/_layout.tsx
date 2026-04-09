import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { useCurrentPatient, UserProvider } from '@context/PatientContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_700Bold,
  Lexend_600SemiBold,
  Lexend_800ExtraBold,
  Lexend_900Black
} from '@expo-google-fonts/lexend';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
  PublicSans_800ExtraBold
} from '@expo-google-fonts/public-sans';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useTheme();
  const { isInitialized } = useCurrentPatient();

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black,
    Lexend_600SemiBold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    PublicSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style={theme.backgroundDark === '#121215' ? 'light' : 'dark'} backgroundColor={theme.backgroundDark} translucent={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.backgroundDark }
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen 
          name="health_measurements" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddNew" 
          options={{ 
            presentation: 'modal', 
            animation: 'slide_from_bottom',
            headerShown: false
          }} 
        />
      </Stack>
      <Toast />
    </>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserProvider>
            <RootLayoutNav />
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}