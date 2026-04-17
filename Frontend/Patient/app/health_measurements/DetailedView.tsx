import { useTheme } from '@context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DashboardMeasurement } from 'src/types/others';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ThemedText, ThemedView } from 'src/components';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { getTrendTitle } from 'src/helpers/detailed_view.helpers';
import { LogRow } from 'src/components/detailed_view/log_row';
import { WeightChart } from 'src/components/detailed_view/weight_chart';

export default function WeightHistoryScreen() {
    const { data, primaryColor, secondaryColor } = useLocalSearchParams<{ data: any; primaryColor: string; secondaryColor: string }>();
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

    useFocusEffect(
        useCallback(() => {
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
        }, [currentPatient?.id, measurement])
    );

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
                        <Text style={[styles.currentValue, { color: primaryColor || theme.primary }]}>{measurement?.numeric_value}</Text>
                        <Text style={[styles.currentUnit, { color: primaryColor || theme.primary }]}>{measurement?.unit.symbol}</Text>
                    </View>

                    {stats && (
                        <View style={[styles.statsPill, { backgroundColor: theme.backgroundLight }]}>
                            <Text style={[styles.statsPillIcon, { color: primaryColor || theme.primary }]}>
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

                    {!isLoading && <WeightChart measurements={allMeasurements} color={primaryColor} />}
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
                                    onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item), primaryColor, secondaryColor } }) }}
                                    key={item.id}
                                >
                                    <LogRow
                                        key={item.id}
                                        item={item}
                                        isLast={isLast}
                                        delta={delta}
                                        measurements={allMeasurements}
                                        color={primaryColor}
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
});