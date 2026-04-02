import { Stack } from "expo-router";
import { ThemedText } from "src/components";

export default function HealthMeasurementsLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen name="addNew" options={{ headerShown: false }} />
        </Stack>
    )
}