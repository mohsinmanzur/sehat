import { useTheme } from "@context/ThemeContext";
import { DashboardMeasurement } from "../../types/others";
import { StyleSheet, Text, View } from "react-native";

export const DeltaBadge: React.FC<{ delta?: number, unit: string, measurements: DashboardMeasurement[] }> = ({ delta, unit, measurements }) => {
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
                { color: measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary }
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