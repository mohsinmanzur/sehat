import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { UserProvider } from '@context/PatientContext';
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

export default function RootLayout() {
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
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />

        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}