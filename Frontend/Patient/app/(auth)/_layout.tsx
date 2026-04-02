import { Stack } from 'expo-router';
import { UnauthorizedOnly } from 'src/components/auth/UnauthorizedOnly';

export default function AuthLayout() {
  return (
    <UnauthorizedOnly>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="Login" options={{ animation: 'none' }} />
        <Stack.Screen name="Signup" options={{ animation: 'none' }} />
        <Stack.Screen name="Otp" options={{ animation: 'none' }} />
      </Stack>
    </UnauthorizedOnly>
  );
}