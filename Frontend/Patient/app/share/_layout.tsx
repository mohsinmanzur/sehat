import { Stack } from "expo-router";

export default function HealthMeasurementsLayout() {
    return (
        <Stack>
            <Stack.Screen name="SelectReports" options={{ headerShown: false }} />
            <Stack.Screen name="SharedDetail" options={{ headerShown: false }} />
            <Stack.Screen name="ScanQR" options={{ headerShown: false }} />
            <Stack.Screen name="SharedDetailedView" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="SharedDashboard" options={{ headerShown: false, animation: 'none' }} />
        </Stack>
    )
}