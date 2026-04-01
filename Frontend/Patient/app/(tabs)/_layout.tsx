import { Stack } from "expo-router";
import { UserOnly } from "src/components/auth/UserOnly";

export default function TabsLayout() {
    return (
        <UserOnly>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Dashboard" />
                <Stack.Screen name="[id]" />
            </Stack>
        </UserOnly>
    )
}