import { useTheme } from "@context/ThemeContext";
import { Stack } from "expo-router";

export default function HealthMeasurementsLayout() {
    const { theme } = useTheme();
    return (
        <Stack>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen name="AddNew" options={{ headerShown: false }} />
            <Stack.Screen
                name="DetailedView"
                options={{
                    headerShown: false,
                    headerTitle: "Weight History",
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: theme.backgroundLight,
                    },
                    headerTitleStyle: {
                        color: theme.text,
                    },
                    headerTintColor: theme.text,
                }} />
            <Stack.Screen name="ItemDetail" options={{ headerShown: false }} />
            <Stack.Screen name="EditMeasurement" options={{ headerShown: false }} />
        </Stack>
    )
}