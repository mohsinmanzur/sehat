import { Stack } from "expo-router";

export default function OnboardingLayout()
{
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false,  }} />
            <Stack.Screen name="ReportsOrganized" options={{ headerShown: false }} />
            <Stack.Screen name="EasilySearch" options={{ headerShown: false }} />
            <Stack.Screen name="AIAnalysis" options={{ headerShown: false }} />
        </Stack>
    )
}