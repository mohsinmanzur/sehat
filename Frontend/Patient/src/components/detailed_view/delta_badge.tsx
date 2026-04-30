import { useTheme } from "@context/ThemeContext";
import { HealthMeasurement } from "../../types/dtos";
import { StyleSheet, Text, View } from "react-native";

export const DeltaBadge: React.FC<{ delta?: number, unit: string, measurements: HealthMeasurement[], color?: string }> = ({ delta, unit, measurements, color }) => {
    const { theme } = useTheme();
    if (delta === undefined) return null;
    const isDown = delta < 0;
    const isNeutral = delta === 0;

    return (
        <View style={[
            styles.deltaBadge,
            { backgroundColor: theme.card }
        ]}>
            <Text style={[
                styles.deltaBadgeText,
                { color: color || theme.primary }
            ]}>
                {isNeutral ? '•' : (isDown ? '↓' : '↑')} {Math.abs(delta).toFixed(1)} {unit}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    deltaBadge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    deltaBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
});