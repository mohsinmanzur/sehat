import { useTheme } from '@context/ThemeContext';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, RefreshControl } from 'react-native';
import { ThemedText, ThemedView } from 'src/components';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { HistoryRow } from 'src/components/detailed_view/history_row';
import { WeightChart } from 'src/components/detailed_view/weight_chart';
import { Header } from 'src/components/detailed_view/header';
import { GhostElement } from 'src/components/GhostElement';
import { ReferenceRange, HealthMeasurement } from '@types/types';
import { findBestReferenceRange } from 'src/helpers/detailed_view.helpers';

export default function DetailedViewScreen() {
    const { data, primaryColor, secondaryColor } = useLocalSearchParams<{ data: string; primaryColor: string; secondaryColor: string }>();
    const { currentPatient } = useCurrentPatient();
    const { theme } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [allMeasurements, setAllMeasurements] = useState<HealthMeasurement[]>([]);
    const [diastolicMeasurements, setDiastolicMeasurements] = useState<(HealthMeasurement | null)[]>([]);

    const [bestReferenceRange, setBestReferenceRange] = useState<ReferenceRange | null>();
    const [diastolicReferenceRange, setDiastolicReferenceRange] = useState<ReferenceRange | null>();

    const measurement = React.useMemo(() => {
        if (!data) return null;
        try {
            return JSON.parse(data) as HealthMeasurement;
        } catch (e) {
            console.error("Failed to parse measurement data", e);
            return null;
        }
    }, [data]);

    const getMeasurements = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const results = await backend.getMeasurementsByPatient(currentPatient.id);
            let filtered = results.filter(m =>
                m.measurement_unit?.measurement_group.toLowerCase() === measurement?.measurement_unit?.measurement_group.toLowerCase()
            );
            let alignedDiastolic: (HealthMeasurement | null)[] = [];

            if (measurement?.measurement_unit?.measurement_group.toLowerCase() === 'blood pressure') {
                const diastolicRaw = filtered.filter(m =>
                    m.measurement_unit?.unit_name.toLowerCase() === 'diastolic'
                );
                filtered = filtered.filter(m => m.measurement_unit?.unit_name.toLowerCase() !== 'diastolic');

                alignedDiastolic = filtered.map(primary =>
                    diastolicRaw.find(sec => sec.created_at === primary.created_at) || null
                );
            } else {
                filtered = filtered.filter(m => m.measurement_unit?.unit_name === measurement?.measurement_unit?.unit_name);
            }

            if (filtered.length === 0) {
                router.back();
                return;
            }

            setAllMeasurements(filtered);
            setDiastolicMeasurements(alignedDiastolic);

            const ranges = await backend.getReferenceRanges(measurement.measurement_unit.id);
            setBestReferenceRange(findBestReferenceRange(measurement, ranges));

            if (alignedDiastolic.length > 0 && alignedDiastolic[0]) {
                const dRanges = await backend.getReferenceRanges(alignedDiastolic[0].measurement_unit.id);
                setDiastolicReferenceRange(findBestReferenceRange(alignedDiastolic[0], dRanges));
            } else {
                setDiastolicReferenceRange(null);
            }
        } catch (error) {
            console.error("Failed to fetch measurements", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [currentPatient?.id, measurement]);

    useFocusEffect(
        useCallback(() => {
            getMeasurements();
        }, [getMeasurements])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getMeasurements(false);
    }, [getMeasurements]);

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
        if (!latest || !oldest) return null;
        const diff = latest.numeric_value - oldest.numeric_value;
        const timeRange = getRelativeTimeRange(oldest.created_at, latest.created_at);

        return {
            diff: diff.toFixed(1),
            timeRange,
            isDown: diff < 0,
            isNeutral: diff === 0
        };
    }, [allMeasurements]);

    return (
        <ThemedView safe style={{ backgroundColor: theme.backgroundDark }}>
            {/* Header */}
            <Header title={`${measurement?.measurement_unit?.measurement_group} History`} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={primaryColor || theme.primary}
                        colors={[primaryColor || theme.backgroundDark]}
                        progressBackgroundColor={theme.backgroundLight}
                    />
                }
            >
                {/* ── Current Weight ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={[styles.currentLabel, { color: theme.textLight }]}>CURRENT {measurement?.measurement_unit?.measurement_group?.toUpperCase()}</Text>
                    {isLoading ? (
                        <GhostElement style={{ height: 68, width: 140, borderRadius: 8, marginBottom: 14 }} />
                    ) : (() => {
                        const primaryVal = allMeasurements[0]?.numeric_value;
                        const diastolicItem = diastolicMeasurements[0]?.numeric_value;

                        return (
                            <View style={styles.currentRow}>
                                <Text style={[styles.currentValue, { color: theme.text }]}>{primaryVal}</Text>
                                {diastolicItem !== undefined && diastolicItem !== null && <Text style={[styles.currentValue, { color: theme.text, fontSize: 45 }]}>/{diastolicItem}</Text>}
                                <Text style={[styles.currentUnit, { color: theme.text }]}>{measurement?.measurement_unit?.symbol}</Text>
                            </View>
                        );
                    })()}

                    {isLoading ? (
                        <GhostElement style={{ height: 38, width: 180, borderRadius: 24, marginBottom: 24 }} />
                    ) : (
                        stats && (
                            <View style={[styles.statsPill, { backgroundColor: theme.backgroundLight }]}>
                                <Text>
                                    <ThemedText style={{ fontFamily: 'PublicSans_700Bold' }}>Target: </ThemedText>
                                    {bestReferenceRange ? (
                                        <ThemedText>
                                            {bestReferenceRange.min_value}
                                            {diastolicReferenceRange && `/${diastolicReferenceRange.min_value}`}
                                            {" - "}
                                            {bestReferenceRange.max_value}
                                            {diastolicReferenceRange && `/${diastolicReferenceRange.max_value}`}
                                            {` ${measurement?.measurement_unit?.symbol}`}
                                        </ThemedText>
                                    ) : (
                                        <ThemedText> - </ThemedText>
                                    )}
                                </Text>
                            </View>
                        )
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
                        {isLoading ? (
                            <GhostElement style={{ height: 20, width: 150, borderRadius: 4, marginBottom: 3 }} />
                        ) : (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={[styles.statsPillIcon, { color: primaryColor || theme.primary }]}>
                                {stats.isNeutral ? '•' : (stats.isDown ? '↘' : '↗')}
                            </Text>
                            <Text style={[styles.statsPillMain, { color: theme.text }]}> {stats.diff} {measurement?.measurement_unit?.symbol}</Text>
                            <Text style={[styles.statsPillSub, { color: theme.textGray }]}>  over {stats.timeRange}</Text>
                        </View>
                        )}
                    </View>

                    {isLoading ? (
                        <GhostElement style={{ height: 180, borderRadius: 12, marginTop: 10 }} />
                    ) : (
                        <WeightChart measurements={allMeasurements} secondaryMeasurements={diastolicMeasurements} color={primaryColor} />
                    )}
                </Animated.View>

                {/* ── History ── */}
                <Animated.View
                    style={{
                        opacity: fadeAnim, transform: [{ translateY: slideAnim }],
                    }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
                    </View>

                    <View style={[styles.logCard, { backgroundColor: theme.backgroundLight }]}>
                        {isLoading ? (
                            <View style={{ padding: 16, gap: 16 }}>
                                {[1, 2, 3, 4].map(key => (
                                    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <GhostElement style={{ width: 44, height: 44, borderRadius: 22 }} />
                                        <View style={{ flex: 1, gap: 8 }}>
                                            <GhostElement style={{ width: '50%', height: 16, borderRadius: 4 }} />
                                            <GhostElement style={{ width: '30%', height: 12, borderRadius: 4 }} />
                                        </View>
                                        <GhostElement style={{ width: 30, height: 16, borderRadius: 4 }} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            allMeasurements.map((item: HealthMeasurement, idx) => {
                                const nextItem = allMeasurements[idx + 1];
                                const delta = nextItem ? item.numeric_value - nextItem.numeric_value : undefined;
                                const isLast = idx === allMeasurements.length - 1;
                                return (
                                    <ScalePressable
                                        onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item), data2: JSON.stringify(diastolicMeasurements?.[idx]), primaryColor, secondaryColor } }) }}
                                        key={item.id}
                                    >
                                        <HistoryRow
                                            key={item.id}
                                            item={item}
                                            secondaryItem={diastolicMeasurements?.[idx]}
                                            isLast={isLast}
                                            delta={delta}
                                            measurements={allMeasurements}
                                            color={primaryColor}
                                        />
                                    </ScalePressable>
                                );
                            })
                        )}
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
        alignItems: 'baseline',
        marginBottom: 14,
    },
    currentValue: {
        fontSize: 68,
        fontWeight: '900',
        lineHeight: 68,
        letterSpacing: -2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
    },
    currentUnit: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 0,
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
        paddingTop: 17,
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