import { useTheme } from "@context/ThemeContext";
import { Stack } from "expo-router";

export default function HealthMeasurementsLayout() {
    const { theme } = useTheme();
    return (
        <Stack>
            <Stack.Screen name="SelectReports" options={{ headerShown: false }} />
            <Stack.Screen name="SharedDetail" options={{ headerShown: false }} />
            <Stack.Screen name="ScanQR" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        </Stack>
    )
}