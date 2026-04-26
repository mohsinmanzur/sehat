import { useTheme } from "@context/ThemeContext";
import { GetHealthMeasurement } from "../../types/others";
import { StyleSheet, Text, View } from "react-native";
import { formatFullDateTime } from "src/utils/date";
import { DeltaBadge } from "./delta_badge";

export const HistoryRow: React.FC<{ item: GetHealthMeasurement; secondaryItem?: GetHealthMeasurement | null; isLast: boolean; delta?: number, measurements: GetHealthMeasurement[], color?: string }> = ({ item, secondaryItem, isLast, delta, measurements, color }) => {
    const { theme } = useTheme();
    
    const isDiastolic = item.measurement_unit?.unit_name?.toLowerCase() === 'diastolic';
    const displayFirst = isDiastolic && secondaryItem ? secondaryItem.numeric_value : item.numeric_value;
    const displaySecond = isDiastolic && secondaryItem ? item.numeric_value : secondaryItem?.numeric_value;

    return (
        <View style={[
            styles.logRow,
            !isLast && { borderBottomColor: theme.backgroundDark, borderBottomWidth: StyleSheet.hairlineWidth },
        ]}>
            <View style={styles.logInfo}>
                <Text style={[styles.logWeight, { color: theme.text }]}>
                    {displayFirst}{displaySecond !== undefined && displaySecond !== null && `/${displaySecond}`} {item.measurement_unit?.symbol}
                </Text>
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