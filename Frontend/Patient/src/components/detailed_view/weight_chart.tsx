import { Dimensions, StyleSheet, Text, View } from "react-native";
import { DashboardMeasurement } from "../../types/others";
import { useTheme } from "@context/ThemeContext";
import { buildAreaPath, buildSmoothPath, formatChartDate } from "src/helpers/detailed_view.helpers";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import React from "react";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 130;
const PAD_X = 12;
const PAD_Y = 16;

interface WeightChartProps {
    measurements: DashboardMeasurement[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ measurements }) => {
    const { theme } = useTheme();

    // measurements are newest-first from the API; reverse to oldest-first for chart
    const chronological = [...measurements].reverse();

    if (chronological.length < 2) {
        return (
            <View style={[styles.chartEmpty, { height: CHART_HEIGHT }]}>
                <Text style={{ color: theme.textVeryLight, fontSize: 13 }}>Not enough data to display chart</Text>
            </View>
        );
    }

    const values = chronological.map(d => d.numeric_value);
    const minVal = Math.min(...values) - 0.5;
    const maxVal = Math.max(...values) + 0.5;

    const toX = (i: number) =>
        PAD_X + (i / (chronological.length - 1)) * (CHART_WIDTH - PAD_X * 4);
    const toY = (v: number) =>
        PAD_Y + ((maxVal - v) / (maxVal - minVal)) * (CHART_HEIGHT - PAD_Y * 2);

    const points = chronological.map((d, i) => ({ x: toX(i), y: toY(d.numeric_value) }));
    const linePath = buildSmoothPath(points);
    const areaPath = buildAreaPath(points, CHART_HEIGHT);

    // Build x-axis labels: always show first, last ("TODAY"), and up to 2 evenly
    // spaced points in between — max 4 labels total.
    const xLabels: { label: string; isToday: boolean; x: number }[] = (() => {
        const total = chronological.length;
        if (total <= 4) {
            return chronological.map((d, i) => ({
                label: i === total - 1 ? 'TODAY' : formatChartDate(d.created_at),
                isToday: i === total - 1,
                x: toX(i),
            }));
        }
        const indices = [
            0,
            Math.round(total / 3),
            Math.round((2 * total) / 3),
            total - 1,
        ];
        return indices.map(i => ({
            label: i === total - 1 ? 'TODAY' : formatChartDate(chronological[i].created_at),
            isToday: i === total - 1,
            x: toX(i),
        }));
    })();

    return (
        <View>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary} stopOpacity="0.18" />
                        <Stop offset="1" stopColor={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary} stopOpacity="0.01" />
                    </LinearGradient>
                </Defs>
                {/* Area fill */}
                <Path d={areaPath} fill="url(#areaGrad)" />
                {/* Line */}
                <Path
                    d={linePath}
                    fill="none"
                    stroke={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* One dot per measurement */}
                {points.map((pt, i) => {
                    const isLast = i === points.length - 1;
                    if (isLast) {
                        // End dot with halo
                        return (
                            <React.Fragment key={i}>
                                <Circle cx={pt.x} cy={pt.y} r={8} fill={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary} opacity={0.15} />
                                <Circle cx={pt.x} cy={pt.y} r={4.5} fill={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary} />
                                <Circle cx={pt.x} cy={pt.y} r={2} fill="#fff" />
                            </React.Fragment>
                        );
                    }
                    return <Circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary} />;
                })}
            </Svg>

            {/* X-axis labels — absolutely positioned to align with their data point */}
            <View style={{ height: 20, position: 'relative' }}>
                {xLabels.map(({ label, isToday, x }) => (
                    <Text
                        key={`${label}-${x}`}
                        style={[
                            styles.chartXLabel,
                            { color: measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary, position: 'absolute', transform: [{ translateX: -24 }], left: x },
                            isToday && { color: measurements[0]?.unit.unit_name === 'Weight' ? theme.warning : measurements[0]?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary, fontWeight: '700' },
                        ]}
                    >
                        {label}
                    </Text>
                ))}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    chartEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartXLabel: {
        fontSize: 11,
        fontWeight: '500',
        paddingHorizontal: 10
    },
});