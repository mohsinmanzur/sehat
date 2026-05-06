import { Stack } from 'expo-router';
import { useTheme } from '@context/ThemeContext';

export default function ProfileLayout() {
  const { theme } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.backgroundDark } }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="UserProfile" />
      <Stack.Screen name="ChangePassword" />
      <Stack.Screen name="FAQs" />
    </Stack>
  );
}
