import { Stack } from "expo-router";
import { UserOnly } from "src/components/auth/UserOnly";

export default function TabsLayout() {
    return (
        <UserOnly>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Dashboard" options={{ animation: 'none' }} />
            </Stack>
        </UserOnly>
    )
}