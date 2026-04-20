import { useTheme } from "@context/ThemeContext";
import { GetHealthMeasurement } from "../../types/others";
import { StyleSheet, Text, View } from "react-native";
import { formatFullDateTime } from "src/utils/date";
import { DeltaBadge } from "./delta_badge";

export const LogRow: React.FC<{ item: GetHealthMeasurement; isLast: boolean; delta?: number, measurements: GetHealthMeasurement[], color?: string }> = ({ item, isLast, delta, measurements, color }) => {
    const { theme } = useTheme();
    return (
        <View style={[
            styles.logRow,
            !isLast && { borderBottomColor: theme.backgroundDark, borderBottomWidth: StyleSheet.hairlineWidth },
        ]}>
            <View style={styles.logInfo}>
                <Text style={[styles.logWeight, { color: theme.text }]}>{item.numeric_value.toFixed(1)} {item.measurement_unit?.symbol}</Text>
                <Text style={[styles.logDate, { color: theme.textLight }]}>{formatFullDateTime(item.created_at)}</Text>
            </View>
            <DeltaBadge delta={delta} unit={item.measurement_unit?.symbol} measurements={measurements} color={color} />
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