import { useTheme } from "@context/ThemeContext";
import { DashboardMeasurement } from "../../types/others";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { StyleSheet, Text } from "react-native";
import { formatFullDateTime } from "src/utils/date";
import { DeltaBadge } from "./delta_badge";

export const LogRow: React.FC<{ item: DashboardMeasurement; isLast: boolean; delta?: number, measurements: DashboardMeasurement[] }> = ({ item, isLast, delta, measurements }) => {
    const { theme } = useTheme();
    return (
        <View style={[
            styles.logRow,
            !isLast && { borderBottomColor: theme.backgroundDark, borderBottomWidth: StyleSheet.hairlineWidth },
        ]}>
            <View style={styles.logInfo}>
                <Text style={[styles.logWeight, { color: theme.text }]}>{item.numeric_value.toFixed(1)} {item.unit.symbol}</Text>
                <Text style={[styles.logDate, { color: theme.textLight }]}>{formatFullDateTime(item.created_at)}</Text>
            </View>
            <DeltaBadge delta={delta} unit={item.unit.symbol} measurements={measurements} />
        </View>
    );
};

const styles = StyleSheet.create({
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 14,
    },
    logRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    logInfo: {
        flex: 1,
    },
    logWeight: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    logDate: {
        fontSize: 12,
        fontWeight: '400',
    },
});