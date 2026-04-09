import { useTheme } from '@context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DashboardMeasurement } from 'src/types/others';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ThemedText, ThemedView } from 'src/components';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { formatFullDateTime, getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Smooth-curve chart ───────────────────────────────────────────────────────
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 130;
const PAD_X = 12;
const PAD_Y = 16;

function buildSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

function buildAreaPath(points: { x: number; y: number }[], bottom: number): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${bottom}`;
    d += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${bottom} Z`;
    return d;
}

// ─── Format a date for chart x-axis labels ────────────────────────────────────
function formatChartDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
}

// ─── Dynamic Chart ────────────────────────────────────────────────────────────
interface WeightChartProps {
    measurements: DashboardMeasurement[];
}

const WeightChart: React.FC<WeightChartProps> = ({ measurements }) => {
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

// ─── Delta Badge ──────────────────────────────────────────────────────────────
const DeltaBadge: React.FC<{ delta?: number, unit: string, measurements: DashboardMeasurement[] }> = ({ delta, unit, measurements }) => {
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

// ─── Log Row ──────────────────────────────────────────────────────────────────
const LogRow: React.FC<{ item: DashboardMeasurement; isLast: boolean; delta?: number, measurements: DashboardMeasurement[] }> = ({ item, isLast, delta, measurements }) => {
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

// ─── Trend title ──────────────────────────────────────────────────────────────
function getTrendTitle(measurements: DashboardMeasurement[]): string {
    if (measurements.length < 2) return 'Trend';
    const start = new Date(measurements[measurements.length - 1].created_at);
    const end = new Date(measurements[0].created_at);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const unit = diffDays <= 14 ? `${diffDays} Day` : diffDays <= 60 ? `${Math.round(diffDays / 7)} Week` : `${Math.round(diffDays / 30)} Month`;
    return `${unit} Trend`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WeightHistoryScreen() {
    const { data } = useLocalSearchParams<{ data: any }>();
    const { currentPatient } = useCurrentPatient();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [allMeasurements, setAllMeasurements] = useState<DashboardMeasurement[]>([]);
    const measurement = React.useMemo(() => {
        if (!data) return null;
        try {
            return JSON.parse(data) as DashboardMeasurement;
        } catch (e) {
            console.error("Failed to parse measurement data", e);
            return null;
        }
    }, [data]);

    useEffect(() => {
        const getMeasurements = async () => {
            if (!currentPatient?.id || !measurement) return;

            try {
                const results = await backend.getMeasurementsByPatient(currentPatient.id);
                const filtered = results.filter(m =>
                    m.unit.unit_name.toLowerCase() === measurement.unit.unit_name.toLowerCase()
                );
                setAllMeasurements(filtered);
            } catch (error) {
                console.error("Failed to fetch measurements", error);
            } finally {
                setIsLoading(false);
            }
        };
        getMeasurements();
    }, [currentPatient?.id, measurement]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const stats = React.useMemo(() => {
        if (!allMeasurements || allMeasurements.length < 2) return null;
        const latest = allMeasurements[0];
        const oldest = allMeasurements[allMeasurements.length - 1];
        const diff = latest.numeric_value - oldest.numeric_value;
        const timeRange = getRelativeTimeRange(oldest.created_at, latest.created_at);

        return {
            diff: diff.toFixed(1),
            timeRange,
            isDown: diff < 0,
            isNeutral: diff === 0
        };
    }, [allMeasurements]);

    const trendTitle = React.useMemo(() => getTrendTitle(allMeasurements), [allMeasurements]);

    return (
        <ThemedView safe style={{ backgroundColor: theme.backgroundDark }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: 'transparent' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={22} color={theme.textGray} />
                </TouchableOpacity>
                <ThemedText style={[styles.headerTitle, { color: theme.textGray }]}>{measurement?.unit.unit_name} History</ThemedText>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.textGray} style={{ opacity: 0 }} />
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Current Weight ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={[styles.currentLabel, { color: theme.textLight }]}>CURRENT {measurement?.unit.unit_name.toUpperCase()}</Text>
                    <View style={styles.currentRow}>
                        <Text style={[styles.currentValue, { color: measurement?.unit.unit_name === 'Weight' ? theme.warning : measurement?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary }]}>{measurement?.numeric_value}</Text>
                        <Text style={[styles.currentUnit, { color: measurement?.unit.unit_name === 'Weight' ? theme.warning : measurement?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary }]}>{measurement?.unit.symbol}</Text>
                    </View>

                    {stats && (
                        <View style={[styles.statsPill, { backgroundColor: theme.backgroundLight }]}>
                            <Text style={[styles.statsPillIcon, { color: measurement?.unit.unit_name === 'Weight' ? theme.warning : measurement?.unit.unit_name === 'Blood Sugar' ? theme.danger : theme.primary }]}>
                                {stats.isNeutral ? '•' : (stats.isDown ? '↘' : '↗')}
                            </Text>
                            <Text style={[styles.statsPillMain, { color: theme.textGray }]}> {stats.diff} {measurement?.unit.symbol}</Text>
                            <Text style={[styles.statsPillSub, { color: theme.textGray }]}>  over {stats.timeRange}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* ── Trend Card ── */}
                <Animated.View
                    style={[
                        styles.card,
                        { backgroundColor: theme.backgroundLight, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{trendTitle}</Text>
                        </View>
                    </View>

                    {!isLoading && <WeightChart measurements={allMeasurements} />}
                </Animated.View>

                {/* ── Daily Log ── */}
                <Animated.View
                    style={{
                        opacity: fadeAnim, transform: [{ translateY: slideAnim }],
                    }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
                    </View>

                    <View style={[styles.logCard, { backgroundColor: theme.backgroundLight }]}>
                        {allMeasurements.map((item, idx) => {
                            const nextItem = allMeasurements[idx + 1];
                            const delta = nextItem ? item.numeric_value - nextItem.numeric_value : undefined;
                            const isLast = idx === allMeasurements.length - 1;
                            return (
                                <ScalePressable
                                    onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item) } }) }}
                                    key={item.id}
                                >
                                    <LogRow
                                        key={item.id}
                                        item={item}
                                        isLast={isLast}
                                        delta={delta}
                                        measurements={allMeasurements}
                                    />
                                </ScalePressable>
                            );
                        })}
                    </View>
                </Animated.View>
            </ScrollView>
        </ThemedView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerIcon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBtnIcon: {
        fontSize: 22,
        fontWeight: '400',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        paddingTop: 8,
    },

    // Current weight
    currentLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.4,
        marginBottom: 6,
        marginTop: 4,
    },
    currentRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 14,
    },
    currentValue: {
        fontSize: 68,
        fontWeight: '900',
        lineHeight: 72,
        letterSpacing: -2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: -1, height: 2 },
        textShadowRadius: 1,
    },
    currentUnit: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
    },

    // Stats pill
    statsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 9,
        marginBottom: 24,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1.5,
    },
    statsPillIcon: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsPillMain: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsPillSub: {
        fontSize: 13,
        fontWeight: '400',
    },

    // Card
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1.5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 3,
    },
    cardSub: {
        fontSize: 13,
        fontWeight: '400',
    },

    // Chart
    chartEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartXLabel: {
        fontSize: 11,
        fontWeight: '500',
        paddingHorizontal: 10
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Log card
    logCard: {
        borderRadius: 20,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
    },
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

    // Delta badge
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