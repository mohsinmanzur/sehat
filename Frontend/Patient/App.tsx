import React, { useCallback } from 'react';
import RootNavigator from 'src/navigation/RootNavigator';
import { ThemeProvider } from 'src/context/ThemeContext';
import { UserProvider } from '@context/PatientContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_600SemiBold, Lexend_800ExtraBold, Lexend_900Black } from '@expo-google-fonts/lexend';
import { PublicSans_400Regular, PublicSans_500Medium, PublicSans_600SemiBold, PublicSans_700Bold, PublicSans_800ExtraBold } from '@expo-google-fonts/public-sans';

SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider>
        <UserProvider>
          <RootNavigator />
          <Toast />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
